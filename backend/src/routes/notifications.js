import { Router } from "express";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const items = await Notification.find({ clinicId: req.user.clinicId, userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json(items);
});

router.patch("/:id/read", auth, async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, clinicId: req.user.clinicId, userId: req.user.id },
    { read: true },
    { new: true }
  );
  res.json(item);
});

router.patch("/read-all", auth, async (req, res) => {
  await Notification.updateMany(
    { clinicId: req.user.clinicId, userId: req.user.id, read: false },
    { read: true }
  );
  res.json({ ok: true });
});

export default router;
