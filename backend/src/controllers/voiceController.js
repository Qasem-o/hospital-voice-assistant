import axios from 'axios';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

export const transcribeAudio = async (req, res) => {
  try {
    const { audioBase64, language = 'en' } = req.body;
    if (!audioBase64) return res.status(400).json({ error: 'Missing audio data' });
    res.json({ success: true, transcript: 'Transcription service placeholder', language, confidence: 0.92 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const synthesizeText = async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(503).json({ error: 'ELEVENLABS_API_KEY not configured' });
    }

    const voiceId = 'EXAVITQu4vr4xnSDxMaL';
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBase64 = Buffer.from(response.data).toString('base64');
    res.json({ success: true, audioBase64, contentType: 'audio/mpeg' });
  } catch (error) {
    const msg = error.response ? `ElevenLabs error ${error.response.status}` : error.message;
    res.status(500).json({ error: msg });
  }
};

export const createAppointmentViaVoice = async (req, res) => {
  try {
    const { userId, doctorId, startTime } = req.body;

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
      bookedVia: 'voice-chat'
    });

    const available = await appointment.validateAvailability();
    if (!available) {
      return res.status(409).json({ error: 'Doctor already booked for this time' });
    }

    await appointment.save();
    res.status(201).json({
      success: true,
      appointment,
      confirmation: `Your appointment with ${doctor.name} is confirmed at ${start.toLocaleTimeString()}.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleCallWebhook = async (req, res) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">Welcome to the Hospital Booking System. Press 1 to book an appointment, or press 2 to hear your appointments.</Say>
      <Gather numDigits="1" action="/api/voice/voice-webhook" method="POST">
      </Gather>
    </Response>`;
  res.type('text/xml');
  res.send(twiml);
};

export const handleVoiceWebhook = async (req, res) => {
  const { Digits } = req.body;
  let twiml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;
  if (Digits === '1') {
    twiml += `<Say voice="alice">Please use the website or app to select your doctor and appointment time.</Say>`;
  } else if (Digits === '2') {
    twiml += `<Say voice="alice">Please log in to the website to view your upcoming appointments.</Say>`;
  } else {
    twiml += `<Say voice="alice">Invalid input. Please try again.</Say><Redirect>/api/voice/call-webhook</Redirect>`;
  }
  twiml += '</Response>';
  res.type('text/xml');
  res.send(twiml);
};

export const initiatePhoneCall = async (req, res) => {
  res.json({
    success: true,
    message: 'Call would be initiated via Twilio in production',
    status: 'demo'
  });
};
