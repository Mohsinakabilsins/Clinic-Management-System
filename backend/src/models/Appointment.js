import mongoose from "mongoose";

const schema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientName: { type: String, required: true },
  mobile: String,
  dateKey: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, default: "Consultation" },
  status: { type: String, enum: ["scheduled", "checked_in", "completed", "cancelled", "no_show"], default: "scheduled" },
  notes: String
}, { timestamps: true });

schema.index({ clinicId: 1, dateKey: 1, time: 1 });
export default mongoose.model("Appointment", schema);
