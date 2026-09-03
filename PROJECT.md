# Appoit — Hospital Appointment Booking System

A full-stack web application for booking hospital appointments, browsing doctors, and interacting with an AI health assistant.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| AI Chatbot | Anthropic Claude (claude-sonnet) |
| Voice | ElevenLabs API |
| SMS | Twilio |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## Project Structure

```
appoit/
├── backend/
│   └── src/
│       ├── server.js               # Express app entry point (port 8000)
│       ├── models/
│       │   ├── Doctor.js           # Doctor schema
│       │   ├── Appointment.js      # Appointment schema
│       │   └── User.js             # User schema
│       ├── controllers/
│       │   ├── doctorController.js     # Doctor CRUD + seed logic
│       │   ├── appointmentController.js
│       │   ├── userController.js       # Register, login, JWT
│       │   ├── aiController.js         # Anthropic AI chat
│       │   └── voiceController.js      # ElevenLabs voice
│       ├── routes/
│       │   ├── doctorRoutes.js
│       │   ├── appointmentRoutes.js
│       │   ├── userRoutes.js
│       │   ├── aiRoutes.js
│       │   └── voiceRoutes.js
│       ├── middleware/             # Auth middleware (JWT verify)
│       └── utils/
└── frontend/
    └── src/
        ├── App.jsx                 # Routes setup
        ├── main.jsx
        ├── pages/
        │   ├── BrowseDoctorsPage.jsx   # Browse & filter doctors by specialty
        │   ├── AppointmentsPage.jsx    # View & manage appointments
        │   └── AuthPage.jsx            # Login / Register
        ├── components/             # Reusable UI components
        └── utils/                  # API helpers
```

---

## API Endpoints

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | Get all active doctors (filter by `?specialty=`) |
| GET | `/api/doctors/:id` | Get doctor by ID |
| GET | `/api/doctors/specialties` | List all specialties |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/appointments` | Get user's appointments |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login, returns JWT |

### AI & Voice
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/chat` | Chat with AI health assistant (Anthropic) |
| POST | `/api/voice` | Text-to-speech via ElevenLabs |

---

## Database Models

### Doctor
```
name, nameAr, specialty, specialtyAr,
description, descriptionAr,
consultationFee, availableHoursStart (default 8),
availableHoursEnd (default 16), isActive, createdAt
```

### User
```
name, email, password (hashed), phone, createdAt
```

### Appointment
```
userId, doctorId, date, time,
status (pending/confirmed/cancelled), notes, createdAt
```

---

## Seeded Doctors

The app auto-seeds 9 doctors on startup across 3 specialties:

| Specialty | Doctors |
|---|---|
| Internal Medicine | Dr. Ahmed Al-Rashidi, Dr. Sara Al-Zahrawi, Dr. Khalid Al-Amin |
| Cardiology | Dr. Faisal Al-Mutar, Dr. Nora Al-Habboubi, Dr. Omar Al-Ghamdi |
| Orthopedics | Dr. Yusuf Al-Jaber, Dr. Layla Al-Suwaidi, Dr. Tariq Al-Harbi |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
npm install
# create .env (see below)
npm run dev
# runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:3000
```

### Environment Variables (`backend/.env`)
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/hospital-booking
JWT_SECRET=your_jwt_secret_key
ANTHROPIC_API_KEY=your_key
GROQ_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
NODE_ENV=development
```

---

## Features

- Browse doctors by specialty (Arabic & English)
- Book, view, and cancel appointments
- JWT-based user authentication
- AI health assistant powered by Anthropic Claude
- Voice support via ElevenLabs
- Auto-seeding of doctor data on server start
- Bilingual UI (Arabic / English)
