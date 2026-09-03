# Voice Features

The Hospital Voice Assistant lets patients **speak** to book appointments instead of filling in a form. It works in Arabic and English.

For the annotated, code-level walkthrough see [HOW_IT_WORKS.md](../HOW_IT_WORKS.md). This document covers behaviour, configuration, and limits.

---

## The three tabs

| Tab | What it does | Status |
|---|---|---|
| **Chat** | Type to the assistant; it books for you | Working |
| **Voice** | Speak to the assistant; it replies out loud | Working |
| **Phone** | Simulated phone-call interface | Demo only — no real calls |

---

## How a voice turn works

```
You speak
   ↓
Browser Web Speech API → text (on-device, no external service)
   ↓
POST /api/ai/chat
   ↓
Backend rebuilds the system prompt from live MongoDB state
   ↓
Groq (llama-3.3-70b-versatile) generates a reply
   ↓
Backend strips any ##BOOK##{...}## tag → { reply, bookingAction }
   ↓
POST /api/voice/synthesize → ElevenLabs → base64 MP3 → plays
   ↓
Frontend writes the appointment to MongoDB
```

### Speech to text

Handled entirely by the browser's `SpeechRecognition`. Language is set from the UI toggle — `ar-SA` or `en-US`. Interim results stream to the screen as you talk so you can check the transcript before sending. Nothing is uploaded for recognition.

> The backend's `POST /api/voice/transcribe` endpoint is a **placeholder** that returns a canned string. It is not used by the app.

### The assistant

The system prompt is rebuilt on **every message** with the current doctor list and each doctor's free slots for today, so the assistant never invents availability. Only the last 10 messages are sent as history, at `temperature 0.4` and `max_tokens 150` — short, factual replies suited to being read aloud.

### Booking

When you confirm both a doctor and a time, the model appends a sentinel to its reply:

```
##BOOK##{"doctor":"Dr. Omar Al-Ghamdi","hour":10,"minute":0,"date":"2026-09-04","reschedule":false}##
```

The backend parses it out and returns it as a structured `bookingAction`, so the tag never reaches the user. The frontend then creates the appointment with `bookedVia: "voice-chat"`. If `reschedule` is true, it cancels the existing appointment with that doctor first.

If the model returns *only* the tag, the backend substitutes a default line ("Booking your appointment now." / "سيتم حجز موعدك الآن.") so there is always something to speak.

### Text to speech

`POST /api/voice/synthesize` calls ElevenLabs `eleven_multilingual_v2` — one multilingual voice covers both Arabic and English — and returns base64 MP3 that the browser plays from a data URL.

**Fallback:** if `ELEVENLABS_API_KEY` is missing or the account is out of credits, the endpoint returns `503` and the frontend switches to the browser's built-in `speechSynthesis`. The assistant never goes silent.

---

## Configuration

```
GROQ_API_KEY=...          # required — no key, no assistant
ELEVENLABS_API_KEY=...    # optional — without it, browser voice is used
```

Voice settings are currently hardcoded in `backend/src/controllers/voiceController.js`:

```js
const voiceId = 'EXAVITQu4vr4xnSDxMaL';
model_id: 'eleven_multilingual_v2',
voice_settings: { stability: 0.5, similarity_boost: 0.75 }
```

Raise `stability` for a flatter, more consistent read; lower it for more expressive delivery.

---

## Example commands

**English**
- "Book me an appointment with Dr. Omar tomorrow at 10 AM"
- "What cardiologists do you have?"
- "Show me my appointments"
- "Cancel my appointment with Dr. Sara"
- "Move my appointment to 2 PM"

**العربية**
- "احجز لي موعد مع دكتور عمر غدا الساعة 10 صباحاً"
- "من هم أطباء القلب المتاحين؟"
- "ما هي مواعيدي؟"
- "ألغِ موعدي مع الدكتورة سارة"

### A typical exchange

```
You: I need to see a heart doctor
AI:  We have three cardiologists — Dr. Faisal Al-Mutar, Dr. Nora Al-Habboubi,
     and Dr. Omar Al-Ghamdi. Who would you prefer?
You: Omar, tomorrow morning
AI:  Dr. Omar Al-Ghamdi has 08:00, 08:30, 09:00 and 10:00 free tomorrow.
     Which suits you?
You: Ten
AI:  Booked — Dr. Omar Al-Ghamdi tomorrow at 10:00.   → appointment created
```

---

## Browser support

| Browser | Speech input | Notes |
|---|---|---|
| Chrome | Full | Best supported |
| Edge | Full | Chromium-based |
| Safari | Full | macOS and iOS |
| Firefox | Limited | `SpeechRecognition` often unavailable — text chat still works |

Speech recognition requires `localhost` or HTTPS, plus microphone permission.

---

## Tips

- Speak in one continuous phrase; recognition stops on a pause (`continuous = false`).
- Include the doctor, day, and time in a single sentence to book in one turn: *"Book Dr. Omar tomorrow at 10 AM."*
- Check the on-screen transcript before pressing Send — you are confirming the text, not the audio.
- Reduce background noise; Arabic recognition in particular degrades quickly with it.

---

## Known limits

- **Phone tab is a simulation.** `POST /api/voice/initiate-call` returns `{ "status": "demo" }`. TwiML webhook handlers exist for an IVR menu, but no Twilio client is configured and no call is ever placed.
- **Sessions are in-memory** and reset on server restart.
- **Only today's availability** is injected into the prompt, so questions about next week are answered less reliably.
- **Appointments are fixed 30-minute slots** within each doctor's 8:00–16:00 window.
