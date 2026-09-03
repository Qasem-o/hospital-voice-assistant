import OpenAI from 'openai';
import dotenv from 'dotenv';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

dotenv.config();

let groq;

if (process.env.GROQ_API_KEY) {
  groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
} else {
  console.warn('⚠️ GROQ_API_KEY not configured. AI chat features will be limited.');
  groq = null;
}

const conversationHistory = {};

export const initializeChat = (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    conversationHistory[sessionId] = [];

    const greeting = 'مرحبا بك في مستشفانا! كيف يمكنني مساعدتك اليوم؟ / Welcome to our hospital! How can I help you today?';

    res.json({ sessionId, message: 'Chat session initialized', greeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { sessionId, userMessage, language = 'en' } = req.body;

    if (!sessionId || !userMessage) {
      return res.status(400).json({ error: 'Missing sessionId or userMessage' });
    }

    if (!groq) {
      return res.status(503).json({
        error: 'AI service not configured',
        reply: 'Please add GROQ_API_KEY to the backend .env file.'
      });
    }

    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [];
    }

    const systemPrompt = await buildSystemPrompt(language);

    conversationHistory[sessionId].push({ role: 'user', content: userMessage });

    const recentHistory = conversationHistory[sessionId].slice(-10);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory
      ],
      temperature: 0.4,
      max_tokens: 150
    });

    let aiMessage = response.choices[0].message.content;

    // Extract structured booking action if AI included one
    let bookingAction = null;
    const bookMatch = aiMessage.match(/##BOOK##(\{[^#]+\})##/);
    if (bookMatch) {
      try {
        bookingAction = JSON.parse(bookMatch[1]);
        aiMessage = aiMessage.replace(/##BOOK##\{[^#]+\}##/, '').trim();
      } catch {
        // ignore malformed JSON
      }
    }

    // Ensure reply is never empty after stripping booking tag
    if (!aiMessage && bookingAction) {
      aiMessage = language === 'ar' ? 'سيتم حجز موعدك الآن.' : 'Booking your appointment now.';
    }

    conversationHistory[sessionId].push({ role: 'assistant', content: aiMessage });

    const bookingInfo = parseAppointmentRequest(userMessage, language);

    res.json({ reply: aiMessage, bookingInfo, bookingAction, sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const aiCreateAppointment = async (req, res) => {
  try {
    const { userId, doctorId, startTime, sessionId } = req.body;

    if (!userId || !doctorId || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const appointment = new Appointment({
      userId, doctorId,
      startTime: start, endTime: end,
      bookedVia: 'ai-chat'
    });

    const available = await appointment.validateAvailability();
    if (!available) {
      return res.status(409).json({ error: 'Doctor already booked for this time' });
    }

    await appointment.save();

    if (conversationHistory[sessionId]) {
      conversationHistory[sessionId].push({
        role: 'assistant',
        content: `Appointment confirmed with ${doctor.name} at ${start.toLocaleTimeString()}.`
      });
    }

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoctorListForAI = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    const formatted = doctors.map(d => ({
      id: d._id,
      name: d.name,
      nameAr: d.nameAr,
      specialty: d.specialty,
      specialtyAr: d.specialtyAr,
      consultationFee: d.consultationFee
    }));
    res.json({ doctors: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const endChatSession = (req, res) => {
  try {
    const { sessionId } = req.params;
    if (conversationHistory[sessionId]) delete conversationHistory[sessionId];
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}


async function buildSystemPrompt(language) {
  const lang = language === 'ar' ? 'Arabic' : 'English';
  const now = new Date();
  const todayStr    = localDateStr(now);
  const tomorrowObj = new Date(now); tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = localDateStr(tomorrowObj);

  const isAfterHours = now.getHours() >= 16;

  const doctors = await Doctor.find({ isActive: true });

  const doctorLines = await Promise.all(doctors.map(async (d) => {
    // Today: only future slots
    const dayStartToday = new Date(`${todayStr}T00:00:00`);
    const dayEndToday   = new Date(`${todayStr}T23:59:59`);
    const bookedToday = await Appointment.find({
      doctorId: d._id, status: { $in: ['confirmed', 'pending'] },
      startTime: { $gte: dayStartToday, $lte: dayEndToday }
    });
    const bookedTodaySet = new Set(bookedToday.map(a => a.startTime.getHours() * 60 + a.startTime.getMinutes()));

    const todaySlots = [];
    for (let h = d.availableHoursStart; h < d.availableHoursEnd; h++) {
      for (const m of [0, 30]) {
        const t = new Date(`${todayStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
        if (t > now && !bookedTodaySet.has(h * 60 + m)) {
          todaySlots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        }
      }
    }

    // Tomorrow: all slots (no past filtering)
    const dayStartTmr = new Date(`${tomorrowStr}T00:00:00`);
    const dayEndTmr   = new Date(`${tomorrowStr}T23:59:59`);
    const bookedTmr = await Appointment.find({
      doctorId: d._id, status: { $in: ['confirmed', 'pending'] },
      startTime: { $gte: dayStartTmr, $lte: dayEndTmr }
    });
    const bookedTmrSet = new Set(bookedTmr.map(a => a.startTime.getHours() * 60 + a.startTime.getMinutes()));

    const tomorrowSlots = [];
    for (let h = d.availableHoursStart; h < d.availableHoursEnd; h++) {
      for (const m of [0, 30]) {
        if (!bookedTmrSet.has(h * 60 + m)) {
          tomorrowSlots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        }
      }
    }

    let availability;
    if (todaySlots.length > 0) {
      availability = `Today (${todayStr}): ${todaySlots.join(', ')} | Tomorrow (${tomorrowStr}): ${tomorrowSlots.join(', ')}`;
    } else if (isAfterHours) {
      availability = `Today's working hours have ended. Tomorrow (${tomorrowStr}): ${tomorrowSlots.join(', ')}`;
    } else {
      availability = `Fully booked today. Tomorrow (${tomorrowStr}): ${tomorrowSlots.join(', ')}`;
    }

    return `- ${d.name} (${d.nameAr}) | ${d.specialty} / ${d.specialtyAr} | ${d.consultationFee} SAR | ${availability}`;
  }));

  const firstDoctor = doctors[0]?.name || 'Dr. Example';

  return `You are a hospital appointment booking assistant. Today is ${todayStr}. Reply in ${lang}. Keep replies to 2-3 sentences max.

DOCTOR LIST (use these EXACT names — never translate or invent names):
${doctorLines.join('\n')}

CRITICAL: When mentioning a doctor in Arabic, use ONLY the Arabic name shown in parentheses above.
If today's hours are over, proactively suggest tomorrow's available slots instead.

When the patient has confirmed BOTH a specific doctor AND a specific time, append on a new line:
##BOOK##{"doctor":"${firstDoctor}","hour":10,"minute":0,"date":"${todayStr}","reschedule":false}##

If the patient wants to RESCHEDULE (change/update) an existing appointment, use "reschedule":true:
##BOOK##{"doctor":"${firstDoctor}","hour":11,"minute":0,"date":"${todayStr}","reschedule":true}##

Use the exact English doctor name in "doctor". Use the correct date in "date". Only append ##BOOK##...## when both doctor and time are confirmed.`;
}

function parseAppointmentRequest(message, language) {
  return {
    mentionsBooking: /book|appoint|حجز|موعد|reserve/i.test(message),
    hasTime: /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm|صباح|مساء)/i.test(message),
    hasDoctor: /doctor|dr\.|طبيب|دكتور/i.test(message)
  };
}
