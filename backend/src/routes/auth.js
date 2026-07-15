import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

function safe(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    doctorId: user.doctorId,
    active: user.active
  };
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase(), active: true });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId, doctorId: user.doctorId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: safe(user) });
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(safe(user));
});

export default router;
