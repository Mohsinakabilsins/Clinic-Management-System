import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "./config/db.js";
import Clinic from "./models/Clinic.js";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";
import Token from "./models/Token.js";
import Appointment from "./models/Appointment.js";
import Notification from "./models/Notification.js";
import { todayKey, dateKeyFromOffset } from "./utils/date.js";

await connectDB();
await Promise.all([
  User.deleteMany({}),
  Clinic.deleteMany({}),
  Doctor.deleteMany({}),
  Token.deleteMany({}),
  Appointment.deleteMany({}),
  Notification.deleteMany({})
]);

const clinic = await Clinic.create({
  name: "Apex Medical Centre",
  location: "Peshawar, Pakistan",
  phone: "+92 91 555 0199",
  email: "hello@apexmedical.pk",
  averageConsultationTime: 15,
  openingTime: "09:00",
  closingTime: "18:00"
});

const doctors = await Doctor.insertMany([
  { name: "Dr. Ayesha Khan", specialty: "General Medicine", averageDuration: 15, consultationFee: 1500, clinicId: clinic._id },
  { name: "Dr. Hamza Ali", specialty: "Cardiology", averageDuration: 20, consultationFee: 2500, clinicId: clinic._id },
  { name: "Dr. Sara Ahmed", specialty: "Dermatology", averageDuration: 18, consultationFee: 2000, clinicId: clinic._id }
]);

const password = await bcrypt.hash("Admin123!", 10);
const receptionPassword = await bcrypt.hash("Reception123!", 10);
const doctorPassword = await bcrypt.hash("Doctor123!", 10);

const admin = await User.create({
  name: "Muhammad Mohsin",
  email: "admin@clinicq.com",
  password,
  role: "admin",
  clinicId: clinic._id
});

const receptionist = await User.create({
  name: "Sarah Wilson",
  email: "reception@clinicq.com",
  password: receptionPassword,
  role: "receptionist",
  clinicId: clinic._id
});

const doctorUser = await User.create({
  name: doctors[0].name,
  email: "doctor@clinicq.com",
  password: doctorPassword,
  role: "doctor",
  clinicId: clinic._id,
  doctorId: doctors[0]._id
});

const names = ["Hassan Raza", "Amina Shah", "Bilal Khan", "Noor Fatima", "Usman Ali", "Mariam Iqbal", "Zain Ahmed", "Hira Noor", "Hamza Farooq", "Sana Malik", "Danish Khan", "Areeba Saeed"];
const statuses = ["completed", "completed", "completed", "completed", "in_consultation", "waiting", "waiting", "waiting", "waiting", "skipped", "completed", "completed"];

await Token.insertMany(names.map((patientName, i) => ({
  clinicId: clinic._id,
  doctorId: doctors[i % doctors.length]._id,
  patientName,
  mobile: `03${String(100000000 + i * 1234567).slice(0, 9)}`,
  sequence: i + 1,
  publicCode: crypto.randomBytes(5).toString("hex"),
  status: statuses[i],
  dateKey: todayKey(),
  calledAt: statuses[i] === "completed" || statuses[i] === "in_consultation" ? new Date(Date.now() - (i + 1) * 18 * 60000) : undefined,
  completedAt: statuses[i] === "completed" ? new Date(Date.now() - i * 12 * 60000) : undefined
})));

const times = ["09:30", "10:00", "10:30", "11:00", "12:00", "14:00", "14:30", "15:00", "16:00"];
await Appointment.insertMany(times.map((time, i) => ({
  clinicId: clinic._id,
  doctorId: doctors[i % doctors.length]._id,
  patientName: names[(i + 2) % names.length],
  mobile: "03001234567",
  dateKey: todayKey(),
  time,
  type: i % 3 === 0 ? "Follow-up" : "Consultation",
  status: i < 2 ? "completed" : "scheduled"
})));

await Token.insertMany([
  { clinicId: clinic._id, doctorId: doctors[0]._id, patientName: "Previous Patient", sequence: 1, publicCode: crypto.randomBytes(5).toString("hex"), status: "completed", dateKey: dateKeyFromOffset(-1) },
  { clinicId: clinic._id, doctorId: doctors[1]._id, patientName: "Previous Patient", sequence: 2, publicCode: crypto.randomBytes(5).toString("hex"), status: "completed", dateKey: dateKeyFromOffset(-1) }
]);

await Notification.insertMany([
  { clinicId: clinic._id, userId: admin._id, title: "ClinicQ 2.0 is ready", message: "Your new operations workspace has been configured.", type: "success" },
  { clinicId: clinic._id, userId: admin._id, title: "Queue performance", message: "You have completed 6 patient visits today.", type: "info" },
  { clinicId: clinic._id, userId: receptionist._id, title: "Queue is live", message: "Patient flow is currently active.", type: "success" },
  { clinicId: clinic._id, userId: doctorUser._id, title: "Next patient ready", message: "Your next patient is waiting in the queue.", type: "info" }
]);

console.log("ClinicQ 2.0 demo seeded.");
console.log("Admin: admin@clinicq.com / Admin123!");
console.log("Reception: reception@clinicq.com / Reception123!");
console.log("Doctor: doctor@clinicq.com / Doctor123!");
await mongoose.disconnect();
