import { Router } from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { auth, roles } from "../middleware/auth.js";
import { todayKey } from "../utils/date.js";
import { emitClinic } from "../socket.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const dateKey = req.query.date || todayKey();
  const appointments = await Appointment.find({ clinicId: req.user.clinicId, dateKey })
    .populate("doctorId", "name specialty")
    .sort({ time: 1 });
  res.json(appointments);
});

router.post("/", auth, roles("admin", "receptionist"), async (req, res) => {
  const { doctorId, patientName, mobile, dateKey, time, type, notes } = req.body;
  const doctor = await Doctor.findOne({ _id: doctorId, clinicId: req.user.clinicId, active: true });
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  const appointment = await Appointment.create({
    clinicId: req.user.clinicId,
    doctorId,
    patientName,
    mobile,
    dateKey,
    time,
    type,
    notes
  });
  emitClinic(req.user.clinicId, "appointments:updated", { type: "created" });
  res.status(201).json(await appointment.populate("doctorId", "name specialty"));
});

router.patch("/:id/status", auth, roles("admin", "receptionist", "doctor"), async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, clinicId: req.user.clinicId },
    { status: req.body.status },
    { new: true }
  );
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  emitClinic(req.user.clinicId, "appointments:updated", { type: "status" });
  res.json(appointment);
});

export default router;
