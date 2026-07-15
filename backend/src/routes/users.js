import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { auth, roles } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, roles("admin"), async (req, res) => {
  const users = await User.find({ clinicId: req.user.clinicId }).populate("doctorId", "name specialty").select("-password").sort({ createdAt: -1 });
  res.json(users);
});

router.post("/", auth, roles("admin"), async (req, res) => {
  const { name, email, password, role, doctorId } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: "Name, email, password and role are required" });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    role,
    doctorId: doctorId || null,
    clinicId: req.user.clinicId
  });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, doctorId: user.doctorId });
});

router.patch("/:id", auth, roles("admin"), async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, clinicId: req.user.clinicId },
    { name: req.body.name, role: req.body.role, active: req.body.active },
    { new: true }
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;
