import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  bookedVia: {
    type: String,
    enum: ['website', 'ai-chat', 'voice-chat', 'phone-chat'],
    default: 'website'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

appointmentSchema.methods.validateAvailability = async function () {
  const Appointment = mongoose.model('Appointment');
  const conflict = await Appointment.findOne({
    doctorId: this.doctorId,
    status: { $in: ['confirmed', 'completed'] },
    $or: [
      { startTime: { $lt: this.endTime, $gte: this.startTime } },
      { endTime: { $gt: this.startTime, $lte: this.endTime } },
      { startTime: { $lte: this.startTime }, endTime: { $gte: this.endTime } }
    ]
  });
  return !conflict;
};

export default mongoose.model('Appointment', appointmentSchema);
