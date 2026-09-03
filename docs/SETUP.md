# Setup Guide

Full local setup for the Hospital Voice Assistant.

---

## 1. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ | `node -v` to check |
| MongoDB | Running locally on port 27017, or a MongoDB Atlas cluster — see [MONGODB_SETUP.md](MONGODB_SETUP.md) |
| Groq API key | Required for the assistant. Free at [console.groq.com](https://console.groq.com) |
| ElevenLabs API key | Optional. Without it, replies use the browser voice |
| Chrome or Edge | Best Web Speech API support for voice input |

---

## 2. Get the code

```bash
git clone https://github.com/<your-username>/hospital-voice-assistant.git
cd hospital-voice-assistant
```

---

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/hospital-booking
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NODE_ENV=development
```

Start it:

```bash
npm run dev      # nodemon, reloads on change
# or
npm start
```

The server listens on **port 8000**. You should see:

```
Hospital Booking Server running on port 8000
```

> The port is hardcoded in `src/server.js` — setting `PORT` in `.env` has no effect.

**Never commit `.env`.** It is gitignored; keep it that way.

---

## 4. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

Vite serves on **port 3000** and proxies `/api` to port 8000, so both processes must be running.

---

## 5. Verify

### Doctors seed themselves

Nine doctors across Internal Medicine, Cardiology, and Orthopedics are upserted every time the server starts — there is no seed script to run and no sample data to insert by hand. Any doctor not in the seed list is removed, so the list stays clean across restarts.

Check it:

```bash
curl http://localhost:8000/api/doctors
curl http://localhost:8000/api/doctors/specialties
```

### Walk through the app

1. Open http://localhost:3000 and register an account.
2. **Browse Doctors** — filter by specialty; each card shows the consultation fee and 8:00–16:00 hours.
3. **Book** a 30-minute slot; booking the same slot twice returns `409`.
4. **Appointments** — view and cancel.
5. **Chat** tab — type *"Book me with Dr. Omar tomorrow at 10 AM"*.
6. **Voice** tab — allow the microphone, press Start, and speak the same request.

Switch the UI to العربية and everything — doctor names, speech recognition, and the synthesized voice — follows.

---

## 6. Troubleshooting

**`MongooseServerSelectionError`**
MongoDB isn't running. Start it with `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux).

**Assistant replies "Please add GROQ_API_KEY to the backend .env file."**
`GROQ_API_KEY` is missing or empty. Add it and restart the backend.

**No voice comes back, but text replies work**
`ELEVENLABS_API_KEY` is missing or the account is out of credits. The app falls back to the browser voice automatically — the backend returns `503` from `/api/voice/synthesize` and the frontend handles it.

**The microphone button does nothing**
Web Speech API support is limited in Firefox. Use Chrome, Edge, or Safari, and allow microphone access when prompted. It also requires `localhost` or HTTPS.

**Frontend loads but every request fails**
The backend isn't running, or `VITE_API_URL` is wrong. Restart Vite after changing `.env` — env vars are read at startup.

**Chat forgets the conversation**
Expected. Sessions live in memory and reset when the backend restarts.

---

## 7. Production notes

This is a student project and is **not production-ready**. Before deploying anywhere real you would need to:

- Add token-based authentication and protect the API routes — currently anyone with a `userId` can read or modify that user's appointments.
- Move chat sessions out of process memory into Redis or the database.
- Read the port from the environment instead of hardcoding 8000.
- Serve over HTTPS — the Web Speech API requires it outside `localhost`.
- Set a restrictive CORS origin; it is currently open.
- Wire up Twilio properly if real phone calls are wanted — the phone flow is a simulation today.

Build the frontend with:

```bash
cd frontend
npm run build     # outputs to dist/
```

Do not put real patient data in this application.
