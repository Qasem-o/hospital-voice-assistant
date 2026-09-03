# How the Voice Chat Works

A step-by-step walkthrough of what happens from the moment you press **Start** to the moment you hear the AI speak back.

---

## 1. You Press Start → Browser Listens to Your Voice

When you press the **Start** button, the app tells your browser to activate the microphone using the built-in **Web Speech API**. No external service is involved here — your browser does this on its own.

```js
// VoiceChatBot.jsx
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
recognitionRef.current = new SpeechRecognition();
recognitionRef.current.continuous = false;
recognitionRef.current.interimResults = true;
recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';
```

```js
// VoiceChatBot.jsx — Start button
const startListening = () => {
  if (recognitionRef.current && !isListening && !isSpeaking) {
    recognitionRef.current.start();
  }
};
```

---

## 2. Your Voice Becomes Text

As you speak, the browser converts your words into text in real time (like live subtitles). When you stop talking, the final text is saved.

```js
// VoiceChatBot.jsx
recognitionRef.current.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      setTranscript(event.results[i][0].transcript);
    }
  }
};
```

The text appears on screen so you can review it before sending.

---

## 3. You Press Send → Text Goes to the Backend

When you press **Send**, the text is sent to the backend server over the internet.

```js
// frontend/src/utils/api.js
sendMessage: (sessionId, message, language) => fetch(`${API_BASE}/ai/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId, userMessage: message, language })
}).then(r => r.json()),
```

---

## 4. Backend Builds the AI's Instructions (System Prompt)

Before talking to the AI, the backend reads the database to get the current doctor list and their available time slots for today. It packages all of this into a set of instructions for the AI.

```js
// backend/src/controllers/aiController.js
async function buildSystemPrompt(language) {
  const doctors = await Doctor.find({ isActive: true });

  const doctorLines = await Promise.all(doctors.map(async (d) => {
    const booked = await Appointment.find({
      doctorId: d._id,
      status: { $in: ['confirmed', 'pending'] },
      startTime: { $gte: dayStart, $lte: dayEnd }
    });

    const availability = slots.length
      ? `Available today: ${slots.join(', ')}`
      : 'Fully booked today';

    return `- ${d.name} (${d.nameAr}) | ${d.specialty} | ${d.consultationFee} SAR | ${availability}`;
  }));

  return `You are a hospital appointment booking assistant. Today is ${today}. Reply in ${lang}.

DOCTOR LIST:
${doctorLines.join('\n')}

When the patient confirms a doctor AND time, append:
##BOOK##{"doctor":"...","hour":10,"minute":0,"date":"${today}","reschedule":false}##`;
}
```

This means the AI always knows which doctors are available and what times are free — it reads the live data every single message.

---

## 5. The Backend Asks Groq (Llama AI) for a Reply

The backend sends your message plus the instructions to **Groq** (which runs the Llama 3.3 70B AI model) and waits for a reply.

```js
// backend/src/controllers/aiController.js
const response = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: systemPrompt },
    ...recentHistory   // last 10 messages so AI remembers the conversation
  ],
  temperature: 0.4,
  max_tokens: 150
});

let aiMessage = response.choices[0].message.content;
```

---

## 6. The AI Hides a Booking Command Inside Its Reply

If you confirmed a doctor and a time, the AI secretly attaches a booking tag at the end of its reply. The backend detects and removes it before sending the text to you — but keeps it as a separate instruction.

```js
// backend/src/controllers/aiController.js
const bookMatch = aiMessage.match(/##BOOK##(\{[^#]+\})##/);
if (bookMatch) {
  bookingAction = JSON.parse(bookMatch[1]);
  aiMessage = aiMessage.replace(/##BOOK##\{[^#]+\}##/, '').trim();
}

// If the reply was only the tag, give a default message
if (!aiMessage && bookingAction) {
  aiMessage = language === 'ar' ? 'سيتم حجز موعدك الآن.' : 'Booking your appointment now.';
}

res.json({ reply: aiMessage, bookingAction, sessionId });
```

---

## 7. The Frontend Books the Appointment

If a booking tag was found, the frontend automatically creates the appointment in the database — no extra step needed from you. If it is a reschedule, it cancels the old booking first.

```js
// VoiceChatBot.jsx
const bookAppointmentFromAI = async (bookingAction) => {
  // Cancel old appointment if rescheduling
  if (bookingAction.reschedule && userId) {
    const userAppts = await apiClient.getUserAppointments(userId);
    const existing = userAppts.find(a =>
      a.doctorId?._id === doctor.id && a.status !== 'cancelled'
    );
    if (existing) await apiClient.cancelAppointment(existing._id);
  }

  // Create the new appointment
  const result = await apiClient.createAppointment({
    userId,
    doctorId: doctor.id,
    startTime: apptDate.toISOString(),
    bookedVia: 'voice-chat'
  });
};
```

---

## 8. The Written Reply Is Sent to ElevenLabs → Becomes a Voice

The text reply from Groq is sent to **ElevenLabs**, which converts it into a real human-sounding voice and sends the audio back to play in your browser.

```js
// backend/src/controllers/voiceController.js
const voiceId = 'EXAVITQu4vr4xnSDxMaL';
const response = await axios.post(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
  },
  {
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
    responseType: 'arraybuffer'
  }
);

const audioBase64 = Buffer.from(response.data).toString('base64');
res.json({ success: true, audioBase64 });
```

```js
// VoiceChatBot.jsx — plays the audio
const audio = new Audio(`data:audio/mpeg;base64,${resp.audioBase64}`);
audio.onended = onDone;
await audio.play();
```

If ElevenLabs has no credits, the app automatically falls back to the browser's built-in voice so it never goes completely silent.

---

## Full Flow Summary

```
You speak
   ↓
Browser (Web Speech API) → text
   ↓
Frontend sends text → Backend
   ↓
Backend reads doctors + availability from MongoDB
   ↓
Backend sends message + instructions → Groq (Llama AI)
   ↓
Groq replies with text (+ hidden ##BOOK## tag if booking)
   ↓
Backend strips tag, saves booking action, returns reply text
   ↓
Frontend speaks reply via ElevenLabs (or browser TTS fallback)
   ↓
Frontend creates/updates appointment in MongoDB
```
