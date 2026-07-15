import { Router } from "express";
import Clinic from "../models/Clinic.js";
import { auth, roles } from "../middleware/auth.js";

const router = Router();

router.get("/me", auth, async (req, res) => {
  const clinic = await Clinic.findById(req.user.clinicId);
  res.json(clinic);
});

router.patch("/settings", auth, roles("admin"), async (req, res) => {
  const allowed = ["name", "location", "phone", "email", "timezone", "averageConsultationTime", "openingTime", "closingTime"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const clinic = await Clinic.findByIdAndUpdate(req.user.clinicId, updates, { new: true, runValidators: true });
  res.json(clinic);
});

export default router;
