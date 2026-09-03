# Voice Chat Quick Start

Talk to the hospital assistant in about two minutes.

## Step 1 — Start the app

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev          # http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
```

You need `GROQ_API_KEY` in `backend/.env` — see [docs/SETUP.md](docs/SETUP.md).

## Step 2 — Log in

1. Open http://localhost:3000
2. Register an account (or log in)
3. Open the **🎙️ Voice** tab

## Step 3 — Talk

1. Click **Start Listening** 🎤 and allow microphone access
2. Say: *"Book me an appointment with Dr. Omar tomorrow at 10 AM"*
3. Check the transcript on screen, then click **Send** ✓
4. Listen to the reply 🔊 — if you confirmed a doctor and a time, the appointment is already booked

---

## Example commands

### Booking
- "Book me an appointment with Dr. Omar tomorrow at 10 AM"
- "I need to see a cardiologist this morning"
- "What times does Dr. Sara have free?"

### Managing
- "Show me my appointments"
- "Cancel my appointment with Dr. Khalid"
- "Move my appointment to 2 PM"

### العربية
- "احجز لي موعد مع دكتور عمر غدا الساعة 10 صباحاً"
- "أريد طبيب قلب اليوم"
- "ما هي مواعيدي؟"

---

## Phone tab

The **📞 Phone** tab is a **demo** — it shows the call flow in the UI, but no real call is placed. Twilio is not wired up. See [docs/VOICE.md](docs/VOICE.md).

---

## Troubleshooting

**Microphone button does nothing?**
Use Chrome, Edge, or Safari — Firefox's speech recognition is unreliable. Allow permission when asked.

**No audio?**
Check your volume. If `ELEVENLABS_API_KEY` is missing or out of credits, the app falls back to the browser voice automatically.

**Assistant says to add GROQ_API_KEY?**
Add the key to `backend/.env` and restart the backend.

**Misheard you?**
Speak in one continuous phrase, reduce background noise, and review the transcript before sending.

---

## Browser support

| Browser | Status | Notes |
|---|---|---|
| Chrome | ✅ Best | Full support |
| Edge | ✅ Full | Chromium-based |
| Safari | ✅ Full | macOS & iOS |
| Firefox | ⚠️ Limited | Speech-to-text often unavailable |

---

## What's happening

```
You speak
   ↓
Browser converts speech → text
   ↓
Sent to the backend with live doctor availability
   ↓
Groq (Llama 3.3 70B) generates a reply
   ↓
ElevenLabs speaks it back
   ↓
Appointment is written to MongoDB
```

Full walkthrough: [HOW_IT_WORKS.md](HOW_IT_WORKS.md)
