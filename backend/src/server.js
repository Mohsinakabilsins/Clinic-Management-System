import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import userRoutes from "./routes/users.js";
import clinicRoutes from "./routes/clinic.js";
import queueRoutes from "./routes/queue.js";
import appointmentRoutes from "./routes/appointments.js";
import notificationRoutes from "./routes/notifications.js";
import reportRoutes from "./routes/reports.js";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_, res) => res.json({ ok: true, app: "ClinicQ 2.0" }));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

initSocket(server);

const port = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(port, () => console.log(`ClinicQ 2.0 backend running on port ${port}`));
}).catch(err => {
  console.error("Database connection failed:", err.message);
  process.exit(1);
});
