import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  specialty: { type: String, required: true },
  specialtyAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  consultationFee: { type: Number, required: true },
  availableHoursStart: { type: Number, default: 8 },
  availableHoursEnd: { type: Number, default: 16 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Doctor', doctorSchema);
