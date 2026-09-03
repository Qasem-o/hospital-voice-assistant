# Hospital Voice Assistant — Architecture Reference

A full-stack hospital appointment booking system with an AI assistant that patients can chat or speak to, in Arabic or English.

For setup see [docs/SETUP.md](docs/SETUP.md). For the voice pipeline see [HOW_IT_WORKS.md](HOW_IT_WORKS.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS, Vite |
| Backend | Node.js, Express 4 (ES modules) |
| Database | MongoDB, Mongoose 7 |
| Conversational AI | Groq — `llama-3.3-70b-versatile`, called through the OpenAI SDK with a Groq `baseURL` |
| Speech → text | Browser Web Speech API |
| Text → speech | ElevenLabs `eleven_multilingual_v2`, falling back to browser `speechSynthesis` |
| Passwords | bcryptjs |

---

## Project Structure

```
.
├── backend/
│   └── src/
│       ├── server.js                   # Express entry point, port 8000 (hardcoded)
│       ├── models/
│       │   ├── Doctor.js
│       │   ├── Appointment.js          # + validateAvailability()
│       │   └── User.js                 # bcrypt pre-save hook, comparePassword()
│       ├── controllers/
│       │   ├── doctorController.js     # listing + startup seed
│       │   ├── appointmentController.js
│       │   ├── userController.js       # register / login
│       │   ├── aiController.js         # Groq chat, prompt building, ##BOOK## parsing
│       │   └── voiceController.js      # ElevenLabs TTS, voice booking, TwiML stubs
│       ├── routes/                     # one router per controller
│       └── utils/translations.js
└── frontend/
    └── src/
        ├── App.jsx                     # routes and tab shell
        ├── main.jsx
        ├── pages/
        │   ├── BrowseDoctorsPage.jsx
        │   ├── AppointmentsPage.jsx
        │   └── AuthPage.jsx
        ├── components/
        │   ├── ChatBot.jsx             # text assistant
        │   ├── VoiceChatBot.jsx        # speech in / speech out
        │   ├── PhoneChatBot.jsx        # simulated call UI
        │   └── DoctorCard.jsx
        └── utils/                      # api client, translations
```

---

## Request Flow

**Website booking** — `BrowseDoctorsPage` → `GET /api/appointments/doctor/:id/slots` → `POST /api/appointments`.

**Assistant booking** — the frontend posts to `POST /api/ai/chat`. The backend rebuilds the system prompt from live database state (doctor list + today's free slots) on every turn, calls Groq with the last 10 messages, then extracts any `##BOOK##{...}##` sentinel the model appended into a structured `bookingAction`. The frontend acts on that to create the appointment.

**Voice** — same as above, with the browser's Web Speech API supplying the text and `POST /api/voice/synthesize` speaking the reply.

---

## API Endpoints

Base: `http://localhost:8000/api` — full reference in [docs/API.md](docs/API.md).

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/doctors` | Active doctors (filter with `?specialty=`) |
| GET | `/doctors/specialties` | Specialties with Arabic names |
| GET | `/doctors/:id` | One doctor |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/appointments` | Book a 30-minute slot |
| GET | `/appointments/user/:userId` | A user's appointments, doctor populated |
| PUT | `/appointments/:id/cancel` | Soft-cancel (sets `status`) |
| GET | `/appointments/doctor/:doctorId/slots` | Slot grid for a date |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/register` | Register |
| POST | `/users/login` | Log in — returns `userId`, no token |
| GET | `/users/:id` | Profile |
| PUT | `/users/:id` | Update profile |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/init-chat` | Start a session |
| POST | `/ai/chat` | Message → reply + optional `bookingAction` |
| POST | `/ai/appointment` | Book from a session (`bookedVia: ai-chat`) |
| GET | `/ai/doctors` | Doctor list formatted for the assistant |
| DELETE | `/ai/chat/:sessionId` | End a session |

### Voice
| Method | Endpoint | Description |
|---|---|---|
| POST | `/voice/synthesize` | Text → base64 MP3 |
| POST | `/voice/voice-booking` | Book (`bookedVia: voice-chat`) |
| POST | `/voice/transcribe` | Placeholder — returns a canned string |
| POST | `/voice/call-webhook` | TwiML IVR menu |
| POST | `/voice/voice-webhook` | TwiML menu handler |
| POST | `/voice/initiate-call` | Demo stub — no call is placed |

---

## Database Models

### Doctor
```
name (unique), nameAr, specialty, specialtyAr,
description, descriptionAr, consultationFee,
availableHoursStart (default 8), availableHoursEnd (default 16),
isActive, createdAt
```

### User
```
name, email (unique, lowercased), phone,
password (bcrypt-hashed by pre-save hook),
language ('en' | 'ar'), createdAt
```

### Appointment
```
userId → User, doctorId → Doctor,
startTime, endTime,
status  ('confirmed' | 'cancelled' | 'completed', default 'confirmed'),
bookedVia ('website' | 'ai-chat' | 'voice-chat' | 'phone-chat'),
notes, createdAt, updatedAt
```

`validateAvailability()` rejects any slot overlapping an existing `confirmed` or `completed` appointment for the same doctor.

---

## Seeded Doctors

Nine doctors are upserted on every server start, and any doctor outside the seed list is deleted so the roster stays consistent. All are open 8:00–16:00.

| Specialty | Doctors |
|---|---|
| Internal Medicine | Ahmed Al-Rashidi, Sara Al-Zahrawi, Khalid Al-Amin |
| Cardiology | Faisal Al-Mutar, Nora Al-Habboubi, Omar Al-Ghamdi |
| Orthopedics | Yusuf Al-Jaber, Layla Al-Suwaidi, Tariq Al-Harbi |

---

## Environment Variables

`backend/.env`
```
MONGODB_URI=mongodb://localhost:27017/hospital-booking
GROQ_API_KEY=your_key             # required
ELEVENLABS_API_KEY=your_key       # optional — browser voice is the fallback
NODE_ENV=development
```

`frontend/.env`
```
VITE_API_URL=http://localhost:8000/api
```

The server port is hardcoded to 8000 in `server.js`; `PORT` is not read.

---

## Known Gaps

- No token auth — routes are unprotected and trust the `userId` supplied by the client.
- Chat sessions are held in a plain in-memory object and reset on restart.
- The phone flow is a UI simulation; Twilio is not configured.
- `/voice/transcribe` is a placeholder; recognition happens in the browser.
- Only today's availability is injected into the prompt.
- Not HIPAA/PDPL compliant — do not use real patient data.
