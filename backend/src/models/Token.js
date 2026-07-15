import mongoose from "mongoose";

const schema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientName: { type: String, required: true },
  mobile: String,
  sequence: { type: Number, required: true },
  publicCode: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["waiting", "called", "in_consultation", "completed", "skipped", "cancelled", "no_show"],
    default: "waiting"
  },
  dateKey: { type: String, required: true },
  calledAt: Date,
  completedAt: Date
}, { timestamps: true });

schema.index({ clinicId: 1, doctorId: 1, dateKey: 1, sequence: 1 });
export default mongoose.model("Token", schema);
