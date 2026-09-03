# Office Rental Booking App

A full-stack web application for booking office spaces with AI chatbot support and bilingual (English & Arabic) interface.

## Features

✅ **Office Booking System**
- Browse available offices
- Real-time availability checking
- Hourly and full-day rental options
- Operating hours: 8 AM - 4 PM, Sunday to Thursday
- Hour management to prevent double bookings

✅ **AI Chatbot Integration**
- Conversational AI assistant using OpenAI GPT
- Natural language understanding
- Bilingual support (English & Arabic)
- Can help users browse offices and make bookings through chat

✅ **User Management**
- User registration and login
- Multi-language preference storage
- Booking history

✅ **Bilingual Support**
- Full English and Arabic interface
- RTL support for Arabic
- AI responds in user's preferred language

✅ **Voice Interaction** (NEW!)
- Speech-to-text conversion
- Text-to-speech AI responses
- Natural voice conversations in English & Arabic
- Microphone input/output control

✅ **Phone Call Support** (NEW!)
- Demo phone call interface
- Ready for Twilio integration
- Voice-based booking through phone calls

## Project Structure

```
office-rental-booking-app/
├── backend/                          # Node.js Express API
│   ├── src/
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Office.js
│   │   │   └── Booking.js
│   │   ├── controllers/             # Business logic
│   │   │   ├── userController.js
│   │   │   ├── officeController.js
│   │   │   ├── bookingController.js
│   │   │   └── aiController.js
│   │   ├── routes/                  # API endpoints
│   │   ├── ai/                      # AI integration
│   │   ├── utils/                   # Helper functions
│   │   └── server.js               # Entry point
│   └── package.json
│
├── frontend/                         # React Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── OfficeCard.jsx
│   │   │   └── ChatBot.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── BrowseOfficesPage.jsx
│   │   │   └── BookingsPage.jsx
│   │   ├── utils/
│   │   │   ├── api.js              # API client
│   │   │   └── translations.js     # Multi-language support
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── app.css
│   ├── index.html
│   └── package.json
│
└── docs/
    ├── API.md                      # API documentation
    ├── SETUP.md                    # Setup instructions
    └── VOICE.md                    # Voice interaction guide

```

## Tech Stack

**Backend:**
- Node.js with Express
- MongoDB for data storage
- OpenAI API for AI chatbot
- JWT for authentication
- bcrypt for password hashing
- Twilio API ready (for phone calls)

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- Web Speech API (voice recognition & synthesis)

**Voice Features:**
- Browser Speech Recognition API (Chromium-based browsers)
- Browser Speech Synthesis API (all modern browsers)
- Twilio Integration Ready

## Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB running locally or MongoDB Atlas URI
- OpenAI API key

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values:
# - MONGODB_URI: MongoDB connection string
# - OPENAI_API_KEY: Your OpenAI API key
# - JWT_SECRET: Your JWT secret key

# Start development server
npm run dev
```

The API will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/user/:userId` - Get user's bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/office/:officeId/slots` - Get available slots

### Offices
- `GET /api/offices` - Get all offices
- `GET /api/offices/:id` - Get office details
- `POST /api/offices` - Create office (admin)
- `PUT /api/offices/:id` - Update office (admin)
- `DELETE /api/offices/:id` - Delete office (admin)

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user

### AI Chat
- `POST /api/ai/init-chat` - Initialize chat session
- `POST /api/ai/chat` - Send message to AI
- `POST /api/ai/booking` - Book via AI chat
- `GET /api/ai/offices` - Get offices for AI
- `DELETE /api/ai/chat/:sessionId` - End chat session

## Booking Rules

- **Available Hours:** 8:00 AM - 4:00 PM
- **Available Days:** Sunday to Thursday
- **Minimum Booking:** 1 hour
- **Maximum Booking:** 8 hours per day
- **Hour Management:** Prevents double bookings through conflict checking

## AI Features

The AI chatbot:
- Understands natural language requests in English and Arabic
- Can help users browse offices
- Can assist in making bookings
- Feels natural and human-like in conversations
- Provides helpful information about office availability

### Example Conversations

**English:**
> User: "I want to book an office for tomorrow for 2 hours"
> AI: "Great! I can help with that. What time would you like to start? We have offices available from 8 AM to 4 PM."

**Arabic:**
> User: "أريد حجز مكتب غدا لمدة ساعتين"
> AI: "ممتاز! يمكنني مساعدتك. ما الوقت الذي تفضله؟ لدينا مكاتب متاحة من 8 صباحاً إلى 4 مساءً."

---

## Voice Interaction Features

### 🎙️ Voice Chat
- **Speech-to-Text**: Speak naturally, the app converts your voice to text
- **Text-to-Speech**: AI responds with natural-sounding voice
- **Real-time Conversation**: Have natural conversations with the AI assistant
- **Bilingual Voice**: Works in both English and Arabic
- **Microphone Controls**: Start, stop, and manage recording
- **Voice Feedback**: See what the AI heard and is saying

**How to Use Voice Chat:**
1. Click the "🎙️ Voice" tab
2. Click "Start Listening" button
3. Speak your request clearly (e.g., "I want to book an office for 2 hours tomorrow")
4. Click "Send" to submit
5. Listen to the AI response

**Browser Compatibility:**
- Chrome/Chromium: Full support ✅
- Firefox: Partial (speech-to-text may be limited)
- Safari: Full support ✅
- Edge: Full support ✅
- Mobile browsers: Full support ✅

### 📞 Phone Call Interface
- **Simulated Phone Calls**: Demo interface for phone-based booking
- **Phone Number Input**: Enter your phone number
- **Call Duration Tracking**: See call time
- **Twilio Ready**: Backend ready for real Twilio integration

**How to Use Phone Chat:**
1. Click the "📞 Phone" tab
2. Enter a phone number
3. Click "Start Call"
4. Chat with the AI through the call interface
5. Click "End Call" to finish

**To Enable Real Phone Calls:**
1. Get Twilio credentials from https://www.twilio.com
2. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Update `voiceController.js` to use Twilio SDK
4. Deploy with Twilio webhooks configured

---

## Browser Permissions

The voice chat requires microphone access. Your browser will ask for permission:
1. When you first use voice features
2. Grant permission to enable microphone
3. You can revoke in browser settings anytime

**Security Notes:**
- Audio is processed locally in browser (speech recognition)
- Only transcripts are sent to the server
- No audio files are permanently stored
- HTTPS required for microphone access

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/office-rental
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

## Running the App

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Sample Data

To seed the database with sample offices, you can make a POST request to `/api/offices`:

```json
{
  "name": "Modern Office Suite",
  "description": "Fully equipped modern office with high-speed internet",
  "location": "Downtown Dubai",
  "capacity": 4,
  "pricePerHour": 50,
  "amenities": ["WiFi", "Parking", "Meeting Room", "Coffee"]
}
```

## Future Enhancements

- Payment integration (Stripe, PayPal)
- Email notifications
- Admin dashboard
- Video conferencing integration
- Booking calendar view
- Mobile app
- ✅ Voice interaction with AI
- ✅ Phone call support (Twilio)
- User reviews and ratings
- Office search and filtering
- Real-time notifications
- Advanced NLP for better voice understanding

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
