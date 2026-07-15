import { Router } from "express";
import crypto from "crypto";
import Token from "../models/Token.js";
import Clinic from "../models/Clinic.js";
import Doctor from "../models/Doctor.js";
import { auth, roles } from "../middleware/auth.js";
import { todayKey } from "../utils/date.js";
import { canTransition, estimateMinutes } from "../utils/queue.js";
import { emitQueue, emitPublic } from "../socket.js";

const router = Router();

async function queueFor(clinicId, doctorId, dateKey = todayKey()) {
  return Token.find({ clinicId, doctorId, dateKey }).sort({ sequence: 1 }).lean();
}

router.get("/", auth, async (req, res) => {
  const doctorId = req.query.doctorId || req.user.doctorId;
  if (!doctorId) return res.json([]);
  res.json(await queueFor(req.user.clinicId, doctorId));
});

router.get("/all", auth, async (req, res) => {
  const dateKey = req.query.date || todayKey();
  const tokens = await Token.find({ clinicId: req.user.clinicId, dateKey }).populate("doctorId", "name specialty").sort({ sequence: 1 }).lean();
  res.json(tokens);
});

router.post("/tokens", auth, roles("admin", "receptionist"), async (req, res) => {
  try {
    const { patientName, mobile, doctorId } = req.body;
    if (!patientName || !doctorId) return res.status(400).json({ message: "Patient name and doctor are required" });

    const doctor = await Doctor.findOne({ _id: doctorId, clinicId: req.user.clinicId, active: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const dateKey = todayKey();
    const last = await Token.findOne({ clinicId: req.user.clinicId, doctorId, dateKey }).sort({ sequence: -1 });
    const sequence = (last?.sequence || 0) + 1;

    const token = await Token.create({
      clinicId: req.user.clinicId,
      doctorId,
      patientName,
      mobile,
      sequence,
      dateKey,
      publicCode: crypto.randomBytes(5).toString("hex")
    });

    emitQueue(req.user.clinicId, { type: "token-created" });
    res.status(201).json(token);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/tokens/:id/status", auth, roles("admin", "receptionist", "doctor"), async (req, res) => {
  try {
    const token = await Token.findOne({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!token) return res.status(404).json({ message: "Token not found" });

    if (req.user.role === "doctor" && String(token.doctorId) !== String(req.user.doctorId)) {
      return res.status(403).json({ message: "This token belongs to another doctor" });
    }

    const { status } = req.body;
    if (!canTransition(token.status, status)) {
      return res.status(400).json({ message: `Invalid transition: ${token.status} → ${status}` });
    }

    token.status = status;
    if (status === "called") token.calledAt = new Date();
    if (status === "completed") token.completedAt = new Date();
    await token.save();

    emitQueue(req.user.clinicId, { type: "status-updated" });
    emitPublic(token.publicCode, { type: "status-updated" });
    res.json(token);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/control", auth, roles("admin", "receptionist"), async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(
    req.user.clinicId,
    { queuePaused: req.body.queuePaused, delayMinutes: req.body.delayMinutes },
    { new: true }
  );
  emitQueue(req.user.clinicId, { type: "queue-control" });
  res.json(clinic);
});

router.get("/public/:code", async (req, res) => {
  const token = await Token.findOne({ publicCode: req.params.code }).lean();
  if (!token) return res.status(404).json({ message: "Queue token not found" });

  const tokens = await queueFor(token.clinicId, token.doctorId, token.dateKey);
  const clinic = await Clinic.findById(token.clinicId).lean();
  const doctor = await Doctor.findById(token.doctorId).lean();

  const before = tokens.filter(t =>
    t.sequence < token.sequence &&
    ["waiting", "called", "in_consultation"].includes(t.status)
  ).length;

  res.json({
    token: token.sequence,
    status: token.status,
    patientsBefore: before,
    estimatedMinutes: estimateMinutes(before, doctor?.averageDuration || 15, clinic?.delayMinutes || 0),
    clinicName: clinic?.name,
    doctorName: doctor?.name,
    publicCode: token.publicCode,
    queuePaused: clinic?.queuePaused || false
  });
});

export default router;
