# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

JWT tokens are used for authenticated requests. Include token in header:
```
Authorization: Bearer <token>
```

---

## Booking Endpoints

### Create Booking
**POST** `/bookings`

Creates a new office booking.

**Request Body:**
```json
{
  "userId": "user_id",
  "officeId": "office_id",
  "startTime": "2026-06-08T10:00:00Z",
  "endTime": "2026-06-08T12:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Your booking has been confirmed",
  "booking": {
    "_id": "booking_id",
    "userId": "user_id",
    "officeId": "office_id",
    "startTime": "2026-06-08T10:00:00Z",
    "endTime": "2026-06-08T12:00:00Z",
    "durationHours": 2,
    "totalPrice": 100,
    "status": "confirmed",
    "bookedVia": "website",
    "createdAt": "2026-06-08T09:30:00Z"
  }
}
```

**Validation Rules:**
- Time must be between 8 AM - 4 PM
- Day must be Sunday-Thursday
- Booking duration 1-8 hours
- No overlapping bookings for same office

---

### Get Booking
**GET** `/bookings/:id`

Retrieves a specific booking.

**Response (200):**
```json
{
  "_id": "booking_id",
  "userId": { /* user object */ },
  "officeId": { /* office object */ },
  "startTime": "2026-06-08T10:00:00Z",
  "endTime": "2026-06-08T12:00:00Z",
  "durationHours": 2,
  "totalPrice": 100,
  "status": "confirmed"
}
```

---

### Get User Bookings
**GET** `/bookings/user/:userId`

Retrieves all bookings for a user.

**Response (200):**
```json
[
  {
    "_id": "booking_id",
    "officeId": { /* office object */ },
    "startTime": "2026-06-08T10:00:00Z",
    "endTime": "2026-06-08T12:00:00Z",
    "status": "confirmed"
  }
]
```

---

### Get Available Slots
**GET** `/bookings/office/:officeId/slots?date=YYYY-MM-DD`

Gets hourly available slots for an office on a specific date.

**Response (200):**
```json
[
  { "hour": 8, "available": true },
  { "hour": 9, "available": false },
  { "hour": 10, "available": true },
  ...
]
```

---

### Cancel Booking
**PUT** `/bookings/:id/cancel`

Cancels an existing booking.

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled",
  "booking": {
    "_id": "booking_id",
    "status": "cancelled",
    "updatedAt": "2026-06-08T10:30:00Z"
  }
}
```

---

## Office Endpoints

### Get All Offices
**GET** `/offices`

Retrieves all active offices.

**Response (200):**
```json
[
  {
    "_id": "office_id",
    "name": "Modern Office Suite",
    "description": "Fully equipped office",
    "location": "Downtown Dubai",
    "capacity": 4,
    "pricePerHour": 50,
    "amenities": ["WiFi", "Parking", "Meeting Room"],
    "isActive": true,
    "createdAt": "2026-06-08T09:00:00Z"
  }
]
```

---

### Get Office Details
**GET** `/offices/:id`

Retrieves details for a specific office.

**Response (200):**
```json
{
  "_id": "office_id",
  "name": "Modern Office Suite",
  "description": "Fully equipped office",
  "location": "Downtown Dubai",
  "capacity": 4,
  "pricePerHour": 50,
  "amenities": ["WiFi", "Parking"],
  "images": [],
  "isActive": true
}
```

---

### Create Office (Admin)
**POST** `/offices`

Creates a new office.

**Request Body:**
```json
{
  "name": "Office Name",
  "description": "Office description",
  "location": "Location",
  "capacity": 4,
  "pricePerHour": 50,
  "amenities": ["WiFi", "Parking"]
}
```

**Response (201):**
```json
{
  "_id": "office_id",
  "name": "Office Name",
  "description": "Office description",
  "location": "Location",
  "capacity": 4,
  "pricePerHour": 50,
  "amenities": ["WiFi", "Parking"],
  "isActive": true
}
```

---

### Update Office (Admin)
**PUT** `/offices/:id`

Updates office details.

**Request Body:** (partial)
```json
{
  "pricePerHour": 60,
  "amenities": ["WiFi", "Parking", "Coffee"]
}
```

---

### Delete Office (Admin)
**DELETE** `/offices/:id`

Soft deletes an office (sets isActive to false).

---

## User Endpoints

### Register User
**POST** `/users/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "language": "en"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_id"
}
```

---

### Login User
**POST** `/users/login`

Authenticates user and returns session info.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "userId": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "language": "en"
}
```

---

### Get User Profile
**GET** `/users/:id`

Retrieves user profile information.

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "language": "en",
  "createdAt": "2026-06-08T09:00:00Z"
}
```

---

### Update User
**PUT** `/users/:id`

Updates user information.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+0987654321",
  "language": "ar"
}
```

---

## AI Chat Endpoints

### Initialize Chat Session
**POST** `/ai/init-chat`

Starts a new AI chat session.

**Response (200):**
```json
{
  "sessionId": "session_abc123",
  "message": "Chat session initialized",
  "greeting": "مرحبا! كيف يمكني مساعدتك اليوم? / Hello! How can I help you today?"
}
```

---

### Send Message to AI
**POST** `/ai/chat`

Sends a message to the AI chatbot.

**Request Body:**
```json
{
  "sessionId": "session_abc123",
  "userMessage": "I want to book an office",
  "language": "en"
}
```

**Response (200):**
```json
{
  "reply": "Great! I can help you with that. What location would you prefer?",
  "bookingInfo": {
    "mentionsBooking": true,
    "times": false,
    "dates": false,
    "hours": false
  },
  "sessionId": "session_abc123"
}
```

---

### Get Offices for AI
**GET** `/ai/offices?language=en`

Retrieves office list formatted for AI responses.

**Response (200):**
```json
{
  "offices": [
    {
      "id": "office_id",
      "name": "Modern Office",
      "location": "Downtown",
      "pricePerHour": 50,
      "capacity": 4,
      "amenities": ["WiFi"]
    }
  ],
  "info": "Operating hours: 8 AM - 4 PM | Available days: Sunday - Thursday"
}
```

---

### Create Booking via AI
**POST** `/ai/booking`

Creates a booking through AI chat.

**Request Body:**
```json
{
  "userId": "user_id",
  "officeId": "office_id",
  "startTime": "2026-06-08T10:00:00Z",
  "endTime": "2026-06-08T12:00:00Z",
  "sessionId": "session_abc123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created via AI chat",
  "booking": { /* booking object */ }
}
```

---

### End Chat Session
**DELETE** `/ai/chat/:sessionId`

Ends the AI chat session.

**Response (200):**
```json
{
  "success": true,
  "message": "Chat session ended"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Booking not found"
}
```

### 409 Conflict
```json
{
  "error": "Office already booked",
  "message": "Sorry, this office is already booked for this time"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently not implemented. Under development.

---

## Version

API Version: 1.0.0
Last Updated: June 8, 2026
