import { Router } from "express";
import Token from "../models/Token.js";
import Appointment from "../models/Appointment.js";
import { auth, roles } from "../middleware/auth.js";
import { todayKey, dateKeyFromOffset } from "../utils/date.js";

const router = Router();

router.get("/daily", auth, roles("admin", "receptionist"), async (req, res) => {
  const dateKey = req.query.date || todayKey();
  const tokens = await Token.find({ clinicId: req.user.clinicId, dateKey }).lean();
  const appointments = await Appointment.countDocuments({ clinicId: req.user.clinicId, dateKey });

  res.json({
    date: dateKey,
    total: tokens.length,
    completed: tokens.filter(t => t.status === "completed").length,
    waiting: tokens.filter(t => t.status === "waiting").length,
    noShow: tokens.filter(t => t.status === "no_show").length,
    skipped: tokens.filter(t => t.status === "skipped").length,
    cancelled: tokens.filter(t => t.status === "cancelled").length,
    appointments
  });
});

router.get("/analytics", auth, async (req, res) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = dateKeyFromOffset(-i);
    const tokens = await Token.find({ clinicId: req.user.clinicId, dateKey: date }).lean();
    days.push({
      date,
      label: date.slice(5),
      total: tokens.length,
      completed: tokens.filter(t => t.status === "completed").length,
      skipped: tokens.filter(t => t.status === "skipped").length
    });
  }

  const all = await Token.find({ clinicId: req.user.clinicId, dateKey: todayKey() }).lean();
  const completed = all.filter(t => t.status === "completed");
  const averageWait = completed.length ? Math.round(completed.reduce((sum, t) => {
    if (!t.calledAt || !t.createdAt) return sum;
    return sum + (new Date(t.calledAt) - new Date(t.createdAt)) / 60000;
  }, 0) / completed.length) : 0;

  res.json({
    days,
    totals: {
      patients: all.length,
      completed: completed.length,
      completionRate: all.length ? Math.round(completed.length / all.length * 100) : 0,
      averageWait
    }
  });
});

router.get("/csv", auth, roles("admin", "receptionist"), async (req, res) => {
  const dateKey = req.query.date || todayKey();
  const tokens = await Token.find({ clinicId: req.user.clinicId, dateKey }).populate("doctorId").sort({ sequence: 1 });

  const rows = [
    ["Token", "Patient", "Doctor", "Status", "Date"],
    ...tokens.map(t => [t.sequence, t.patientName, t.doctorId?.name || "", t.status, t.dateKey])
  ];

  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=clinicq-${dateKey}.csv`);
  res.send(csv);
});

export default router;
