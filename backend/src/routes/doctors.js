import { Router } from "express";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { auth, roles } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const doctors = await Doctor.find({ clinicId: req.user.clinicId }).sort({ name: 1 });
  res.json(doctors);
});

router.post("/", auth, roles("admin"), async (req, res) => {
  const doctor = await Doctor.create({ ...req.body, clinicId: req.user.clinicId });
  res.status(201).json(doctor);
});

router.patch("/:id", auth, roles("admin"), async (req, res) => {
  const doctor = await Doctor.findOneAndUpdate(
    { _id: req.params.id, clinicId: req.user.clinicId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

router.delete("/:id", auth, roles("admin"), async (req, res) => {
  const doctor = await Doctor.findOneAndUpdate(
    { _id: req.params.id, clinicId: req.user.clinicId },
    { active: false },
    { new: true }
  );
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  await User.updateMany({ doctorId: doctor._id }, { active: false });
  res.json(doctor);
});

export default router;
