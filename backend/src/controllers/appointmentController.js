import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

export const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, startTime, bookedVia = 'website', notes } = req.body;

    if (!userId || !doctorId || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-minute slot

    const hour = start.getHours();
    if (hour < doctor.availableHoursStart || hour >= doctor.availableHoursEnd) {
      return res.status(400).json({ error: 'Time outside doctor working hours' });
    }

    const appointment = new Appointment({
      userId,
      doctorId,
      startTime: start,
      endTime: end,
      bookedVia,
      notes
    });

    const available = await appointment.validateAvailability();
    if (!available) {
      return res.status(409).json({ error: 'Doctor already has an appointment at this time' });
    }

    await appointment.save();
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ userId })
      .populate('doctorId')
      .sort({ startTime: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctorId,
      status: { $in: ['confirmed', 'completed'] },
      startTime: { $gte: dayStart, $lte: dayEnd }
    });

    const bookedTimes = new Set(booked.map(a => a.startTime.getHours() * 60 + a.startTime.getMinutes()));

    const slots = [];
    for (let h = doctor.availableHoursStart; h < doctor.availableHoursEnd; h++) {
      for (const m of [0, 30]) {
        const minuteKey = h * 60 + m;
        slots.push({
          hour: h,
          minute: m,
          label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          available: !bookedTimes.has(minuteKey)
        });
      }
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
