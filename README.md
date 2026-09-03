# Hospital Voice Assistant

A full-stack hospital appointment booking app you can talk to. Patients browse doctors by specialty, book and cancel appointments, or simply **speak** to an AI assistant that checks live availability and books the slot for them — in **Arabic or English**.

> Formerly named "Appoit".

---

## Features

- **Voice booking** — press Start, speak naturally, and the assistant books the appointment. It reads real doctor availability from the database on every message.
- **AI chat booking** — same assistant in text form.
- **Bilingual (العربية / English)** — UI, doctor records, speech recognition, and synthesized voice all switch language.
- **Doctor browsing** — filter by specialty, see consultation fees and open hours.
- **Appointment management** — book, view, reschedule, and cancel, with double-booking prevention.
- **Spoken replies** — answers are synthesized to natural speech, with an automatic fallback to the browser's built-in voice.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS, Vite |
| Backend | Node.js, Express 4 (ES modules) |
| Database | MongoDB + Mongoose |
| Conversational AI | Groq — `llama-3.3-70b-versatile` (via the OpenAI SDK pointed at Groq) |
| Speech → text | Browser Web Speech API (no external service) |
| Text → speech | ElevenLabs `eleven_multilingual_v2`, falling back to browser `speechSynthesis` |
| Passwords | bcryptjs |

---

## How Voice Booking Works

```
You speak
   ↓
Browser Web Speech API converts speech → text
   ↓
Frontend POSTs the text to the backend
   ↓
Backend loads doctors + today's free slots from MongoDB
   ↓
Backend sends message + live availability → Groq (Llama 3.3 70B)
   ↓
Groq replies, appending a hidden ##BOOK##{...}## tag when you confirm
   ↓
Backend strips the tag, returns clean text + a booking action
   ↓
Frontend speaks the reply (ElevenLabs) and writes the appointment to MongoDB
```

The assistant never guesses availability — the doctor list and open time slots are rebuilt from the database and injected into the system prompt on **every** turn. Booking is triggered by a sentinel tag the model appends once you confirm both a doctor and a time; the backend parses it out so the user never sees it.

See [HOW_IT_WORKS.md](HOW_IT_WORKS.md) for the annotated, code-level walkthrough.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017
- A [Groq](https://console.groq.com) API key (free tier works) — required for the assistant
- An [ElevenLabs](https://elevenlabs.io) API key — optional; without it, replies use the browser voice

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in your keys
npm run dev              # http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

Vite proxies `/api` to the backend, so both must be running.

### 3. Use it

1. Open http://localhost:3000 and register an account.
2. Nine doctors are seeded automatically on server start — no fixtures to load.
3. Open the **Voice** tab, allow microphone access, and try:
   - *"Book me an appointment with Dr. Omar tomorrow at 10 AM"*
   - *"احجز لي موعد مع دكتور عمر غدا الساعة 10 صباحاً"*

Chrome and Edge give the best speech-recognition support; Firefox is limited.

---

## Environment Variables

`backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/hospital-booking
GROQ_API_KEY=your_groq_key
ELEVENLABS_API_KEY=your_elevenlabs_key
NODE_ENV=development
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

**Never commit `.env`.** It is gitignored — keep it that way, and rotate any key that leaks.

---

## API

Base URL: `http://localhost:8000/api`

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/doctors` | List active doctors (filter with `?specialty=`) |
| GET | `/doctors/specialties` | List all specialties |
| GET | `/doctors/:id` | Get one doctor |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/appointments` | Book an appointment |
| GET | `/appointments/user/:userId` | List a user's appointments |
| PUT | `/appointments/:id/cancel` | Cancel an appointment |
| GET | `/appointments/doctor/:doctorId/slots` | Free slots for a doctor |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/register` | Register |
| POST | `/users/login` | Log in |
| GET | `/users/:id` | Get profile |
| PUT | `/users/:id` | Update profile |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/init-chat` | Start a chat session |
| POST | `/ai/chat` | Send a message, get a reply + optional booking action |
| POST | `/ai/appointment` | Create an appointment from an AI booking action |
| GET | `/ai/doctors` | Doctor list formatted for the assistant |
| DELETE | `/ai/chat/:sessionId` | End a session |

### Voice
| Method | Endpoint | Description |
|---|---|---|
| POST | `/voice/synthesize` | Text → speech (returns base64 MP3) |
| POST | `/voice/transcribe` | Audio → text |
| POST | `/voice/voice-booking` | Book via a voice flow |

Full request/response shapes: [docs/API.md](docs/API.md).

---

## Data Models

**Doctor** — `name`, `nameAr`, `specialty`, `specialtyAr`, `description`, `descriptionAr`, `consultationFee`, `availableHoursStart` (default 8), `availableHoursEnd` (default 16), `isActive`

**User** — `name`, `email`, `phone`, `password` (bcrypt-hashed via a pre-save hook), `language`

**Appointment** — `userId`, `doctorId`, `startTime`, `endTime`, `status` (`confirmed` / `cancelled` / `completed`), `bookedVia` (`website` / `ai-chat` / `voice-chat` / `phone-chat`), `notes`

`Appointment.validateAvailability()` rejects any slot that overlaps an existing confirmed or completed booking.

### Seeded Doctors

Nine doctors across three specialties, upserted on every server start, each open 8:00–16:00:

| Specialty | Doctors |
|---|---|
| Internal Medicine | Ahmed Al-Rashidi, Sara Al-Zahrawi, Khalid Al-Amin |
| Cardiology | Faisal Al-Mutar, Nora Al-Habboubi, Omar Al-Ghamdi |
| Orthopedics | Yusuf Al-Jaber, Layla Al-Suwaidi, Tariq Al-Harbi |

---

## Project Structure

```
.
├── backend/
│   └── src/
│       ├── server.js            # Express entry point, port 8000
│       ├── models/              # Doctor, User, Appointment
│       ├── controllers/         # doctor, appointment, user, ai, voice
│       ├── routes/              # one router per controller
│       └── utils/translations.js
└── frontend/
    └── src/
        ├── App.jsx              # routes
        ├── pages/               # BrowseDoctors, Appointments, Auth
        ├── components/          # ChatBot, VoiceChatBot, PhoneChatBot, DoctorCard
        └── utils/               # api client, translations
```

---

## Project Status

This is a **student / portfolio project**, not a production medical system. Known gaps, stated plainly:

- **No token auth.** Login verifies a bcrypt-hashed password and returns a `userId`; there are no JWTs and API routes are not protected. Anyone who knows a `userId` can read or modify that user's appointments.
- **The Phone tab is a simulation.** It demonstrates the call flow in the UI only — Twilio is not wired up, and no real calls are placed.
- **Chat history is in memory.** Sessions live in a plain object and are lost on server restart.
- **Port 8000 is hardcoded** in `server.js`; the `PORT` variable is not read.
- **Not HIPAA/PDPL compliant** — do not put real patient data in it.

---

## Documentation

- [HOW_IT_WORKS.md](HOW_IT_WORKS.md) — annotated walkthrough of the voice pipeline
- [PROJECT.md](PROJECT.md) — architecture reference
- [docs/SETUP.md](docs/SETUP.md) — detailed setup
- [docs/MONGODB_SETUP.md](docs/MONGODB_SETUP.md) — local and Atlas database setup
- [docs/API.md](docs/API.md) — API reference
- [docs/VOICE.md](docs/VOICE.md) — voice feature details

---

## License

MIT
