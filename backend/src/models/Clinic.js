import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  phone: String,
  email: String,
  timezone: { type: String, default: "Asia/Karachi" },
  averageConsultationTime: { type: Number, default: 15 },
  queuePaused: { type: Boolean, default: false },
  delayMinutes: { type: Number, default: 0 },
  openingTime: { type: String, default: "09:00" },
  closingTime: { type: String, default: "18:00" }
}, { timestamps: true });

export default mongoose.model("Clinic", schema);
