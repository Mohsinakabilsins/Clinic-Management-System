import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, default: "General Medicine" },
  bio: { type: String, default: "" },
  averageDuration: { type: Number, default: 15 },
  consultationFee: { type: Number, default: 1500 },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Doctor", schema);
