# API Reference

Base URL: `http://localhost:8000/api`

All requests and responses are JSON. There is currently **no authentication layer** — routes are unprotected and identify the caller by the `userId` in the request body or path. See the Project Status section of the [README](../README.md).

---

## Doctors

### List doctors
**GET** `/doctors` — optional `?specialty=Cardiology`

Returns active doctors only.

```json
[
  {
    "_id": "665f1a...",
    "name": "Dr. Omar Al-Ghamdi",
    "nameAr": "د. عمر الغامدي",
    "specialty": "Cardiology",
    "specialtyAr": "أمراض القلب",
    "description": "...",
    "descriptionAr": "...",
    "consultationFee": 300,
    "availableHoursStart": 8,
    "availableHoursEnd": 16,
    "isActive": true
  }
]
```

### List specialties
**GET** `/doctors/specialties`

```json
[
  { "specialty": "Internal Medicine", "specialtyAr": "الطب الباطني" },
  { "specialty": "Cardiology", "specialtyAr": "أمراض القلب" },
  { "specialty": "Orthopedics", "specialtyAr": "جراحة العظام" }
]
```

### Get one doctor
**GET** `/doctors/:id`

Returns the doctor object, or `404 { "error": "Doctor not found" }`.

---

## Appointments

### Book an appointment
**POST** `/appointments`

```json
{
  "userId": "665e...",
  "doctorId": "665f...",
  "startTime": "2026-09-04T10:00:00.000Z",
  "bookedVia": "website",
  "notes": "optional"
}
```

`endTime` is derived automatically — every appointment is a **30-minute slot**. `bookedVia` is one of `website`, `ai-chat`, `voice-chat`, `phone-chat` (default `website`).

**201**
```json
{ "success": true, "appointment": { "_id": "...", "status": "confirmed", "...": "..." } }
```

Errors:
| Status | Meaning |
|---|---|
| 400 | Missing `userId`, `doctorId`, or `startTime` |
| 400 | `Time outside doctor working hours` (before `availableHoursStart` or at/after `availableHoursEnd`) |
| 404 | `Doctor not found` |
| 409 | `Doctor already has an appointment at this time` |

### List a user's appointments
**GET** `/appointments/user/:userId`

Returns all appointments for the user, newest first, with `doctorId` populated into a full doctor object.

### Cancel an appointment
**PUT** `/appointments/:id/cancel`

Sets `status` to `cancelled` — the record is kept, not deleted.

```json
{ "success": true, "appointment": { "status": "cancelled", "...": "..." } }
```

### Get a doctor's slots for a day
**GET** `/appointments/doctor/:doctorId/slots?date=YYYY-MM-DD`

Returns every 30-minute slot in the doctor's working hours, each flagged available or not.

```json
[
  { "hour": 8,  "minute": 0,  "label": "08:00", "available": true },
  { "hour": 8,  "minute": 30, "label": "08:30", "available": false }
]
```

---

## Users

### Register
**POST** `/users/register`

```json
{ "name": "...", "email": "...", "phone": "...", "password": "...", "language": "en" }
```

**201** `{ "success": true, "message": "User registered successfully", "userId": "..." }`
**400** `{ "error": "Email already registered" }`

Passwords are hashed with bcryptjs by a pre-save hook before they touch the database.

### Log in
**POST** `/users/login`

```json
{ "email": "...", "password": "..." }
```

```json
{ "success": true, "userId": "...", "name": "...", "email": "...", "language": "en" }
```

**401** `{ "error": "Invalid credentials" }`

> No token is issued. The client stores the returned `userId` and sends it with subsequent requests.

### Get / update profile
**GET** `/users/:id` — returns the user without the password field.
**PUT** `/users/:id` — accepts `name`, `phone`, `language`.

---

## AI Assistant

### Start a session
**POST** `/ai/init-chat`

```json
{
  "sessionId": "k3n8fq2la",
  "message": "Chat session initialized",
  "greeting": "مرحبا بك في مستشفانا! ... / Welcome to our hospital! How can I help you today?"
}
```

Sessions are held **in memory** and are lost when the server restarts.

### Send a message
**POST** `/ai/chat`

```json
{ "sessionId": "k3n8fq2la", "userMessage": "Book me with Dr. Omar at 10am tomorrow", "language": "en" }
```

```json
{
  "reply": "Booked — Dr. Omar Al-Ghamdi tomorrow at 10:00.",
  "bookingInfo": { "mentionsBooking": true, "hasTime": true, "hasDoctor": true },
  "bookingAction": { "doctor": "Dr. Omar Al-Ghamdi", "hour": 10, "minute": 0, "date": "2026-09-04", "reschedule": false },
  "sessionId": "k3n8fq2la"
}
```

`bookingAction` is `null` until you confirm both a doctor and a time. Under the hood the model appends a `##BOOK##{...}##` tag to its reply; the backend parses it out, so the tag never reaches the client. The frontend acts on `bookingAction` by creating the appointment.

The system prompt is rebuilt on every message from live database state — the current doctor list and each doctor's free slots for today — so availability is never guessed. Only the last 10 messages are sent as history; the model is `llama-3.3-70b-versatile` on Groq at `temperature 0.4`, `max_tokens 150`.

**503** `{ "error": "AI service not configured" }` when `GROQ_API_KEY` is absent.

### Book from a chat session
**POST** `/ai/appointment` — `{ userId, doctorId, startTime, sessionId }`

Same rules as `POST /appointments`, but records `bookedVia: "ai-chat"` and appends a confirmation line to the session history.

### Doctor list for the assistant
**GET** `/ai/doctors`

```json
{ "doctors": [ { "id": "...", "name": "...", "nameAr": "...", "specialty": "...", "specialtyAr": "...", "consultationFee": 300 } ] }
```

### End a session
**DELETE** `/ai/chat/:sessionId` → `{ "success": true }`

---

## Voice

### Text to speech
**POST** `/voice/synthesize` — `{ "text": "...", "language": "en" }`

```json
{ "success": true, "audioBase64": "//uQxAAA...", "contentType": "audio/mpeg" }
```

Uses ElevenLabs `eleven_multilingual_v2` (stability `0.5`, similarity boost `0.75`). Play it client-side from a `data:audio/mpeg;base64,...` URL.

**503** `{ "error": "ELEVENLABS_API_KEY not configured" }` — the frontend then falls back to the browser's `speechSynthesis`.

### Book by voice
**POST** `/voice/voice-booking` — `{ userId, doctorId, startTime }`

Records `bookedVia: "voice-chat"` and returns a spoken-style confirmation string alongside the appointment.

### Speech to text
**POST** `/voice/transcribe`

> **Placeholder.** Returns a canned `"Transcription service placeholder"` response. Real speech recognition happens in the browser via the Web Speech API, not here.

### Telephony webhooks
**POST** `/voice/call-webhook`, **POST** `/voice/voice-webhook`

Return TwiML for an IVR menu (1 = book, 2 = hear appointments).

**POST** `/voice/initiate-call`

> **Demo only.** Returns `{ "success": true, "message": "Call would be initiated via Twilio in production", "status": "demo" }`. No Twilio client is configured and no call is placed.

---

## Errors

Errors are returned as `{ "error": "message" }` with a conventional status code:

| Status | Meaning |
|---|---|
| 400 | Missing or invalid fields |
| 401 | Invalid login credentials |
| 404 | Doctor, user, or appointment not found |
| 409 | Time slot already taken |
| 500 | Server or upstream API error |
| 503 | A required API key is not configured |
