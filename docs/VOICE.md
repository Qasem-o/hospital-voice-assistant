# Voice Interaction Guide

## Overview

The Office Rental Booking App now includes full voice interaction capabilities, allowing users to:
- **Speak naturally** with the AI chatbot
- **Book offices** using voice commands
- **Make phone calls** to the AI assistant
- **Interact in English & Arabic** with natural-sounding responses

---

## Features

### 🎙️ Voice Chat
Real-time voice conversation with AI assistant.

**What it does:**
- Listens to your voice
- Converts speech to text
- Processes your request via AI
- Responds with natural-sounding voice

**Browser Support:**
| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Full | Best voice quality |
| Firefox | ⚠️ Partial | Speech-to-text may be limited |
| Safari  | ✅ Full | Native support |
| Edge    | ✅ Full | Chromium-based |
| Mobile  | ✅ Full | iOS Safari & Android Chrome |

### 📞 Phone Calls
Demo interface with Twilio ready for production.

**What it does:**
- Display phone call interface
- Track call duration
- Simulate or real phone conversation
- Voice booking through phone

---

## How to Use

### Voice Chat Setup

#### 1. Microphone Permission
First time using voice:
1. Browser asks for microphone permission
2. Click "Allow" 
3. Ready to use voice features!

#### 2. Start Voice Chat
```
1. Log in to the app
2. Click "🎙️ Voice" tab in navigation
3. See the Voice Chat interface
```

#### 3. Voice Conversation Flow
```
User speaks
  ↓
Browser converts speech to text (via Web Speech API)
  ↓
Text sent to server
  ↓
AI processes request (via OpenAI)
  ↓
AI response sent back
  ↓
Browser converts response to speech
  ↓
User hears AI voice
```

#### 4. Control Voice
```
Button          | Function
----------------|------------------
🎤 Start        | Begin listening
⏹️ Stop         | Stop recording
✓ Send          | Submit text
💬 Stop Voice   | Stop AI speaking
```

### Example Conversation (Voice)

**User speaks:** 
> "I want to book an office for tomorrow from 10 AM to 12 PM"

**What happens:**
1. Your voice is captured
2. Converted to text: "I want to book an office for tomorrow from 10 AM to 12 PM"
3. Sent to AI
4. AI understands the intent
5. AI responds: "Great! I can help you with that. I found Modern Office Suite available tomorrow from 10 AM to 12 PM. Would you like me to book it for you?"
6. You hear this response spoken naturally

**User responds:**
> "Yes, book it"

**Result:**
> Booking confirmed! Your booking for Modern Office Suite from 10 AM to 12 PM tomorrow has been confirmed. The total price is $100.

---

### Phone Call Setup

#### 1. Demo Mode
```
1. Click "📞 Phone" tab
2. Enter phone number
3. Click "Start Call"
4. Chat with AI during call
5. Click "End Call" to finish
```

#### 2. Production Setup (Real Calls with Twilio)

**Get Twilio Account:**
1. Visit https://www.twilio.com
2. Sign up for free account
3. Get API credentials:
   - Account SID
   - Auth Token
   - Phone Number

**Configure Backend:**
```bash
# 1. Install dependencies
cd backend
npm install twilio

# 2. Update .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api/voice/call-webhook

# 3. Update voiceController.js (uncomment Twilio code)

# 4. Deploy with HTTPS
# Twilio requires HTTPS for webhooks
```

**How it Works:**
```
User types phone number
  ↓
Clicks "Start Call"
  ↓
Server initiates Twilio outbound call
  ↓
Twilio dials user's phone
  ↓
User answers
  ↓
Twilio TwiML script controls conversation flow
  ↓
Voice input processed during call
  ↓
AI responds via text-to-speech
  ↓
User can respond with DTMF (button presses) or speech
  ↓
Booking confirmed via phone
```

---

## Voice API Endpoints

### Backend API for Voice

**Transcribe Audio:**
```
POST /api/voice/transcribe
Body: {
  "audioBase64": "base64-encoded-audio",
  "language": "en" | "ar"
}
Response: {
  "transcript": "I want to book an office",
  "confidence": 0.92,
  "language": "en"
}
```

**Synthesize Speech:**
```
POST /api/voice/synthesize
Body: {
  "text": "Your booking is confirmed",
  "language": "en" | "ar"
}
Response: {
  "audioUrl": "https://...",
  "audioBase64": "...",
  "duration": 3
}
```

**Voice Booking:**
```
POST /api/voice/voice-booking
Body: {
  "userId": "user_id",
  "officeId": "office_id",
  "startTime": "2026-06-08T10:00:00Z",
  "endTime": "2026-06-08T12:00:00Z",
  "transcript": "I want to book office for 2 hours"
}
Response: {
  "success": true,
  "booking": {...},
  "confirmation": "Your booking has been confirmed"
}
```

**Initiate Phone Call:**
```
POST /api/voice/initiate-call
Body: {
  "userId": "user_id",
  "phoneNumber": "+966501234567"
}
Response: {
  "success": true,
  "callSid": "CA...",
  "status": "initiated"
}
```

---

## Advanced Features

### Natural Language Understanding

The AI understands various booking patterns:

**English Examples:**
- "Book me an office for tomorrow 2 hours"
- "I need a meeting room at 10 AM for 1 hour"
- "Can I rent an office from noon to 2 PM?"
- "Show me available offices near downtown"

**Arabic Examples:**
- "احجز لي مكتب غدا لمدة ساعتين"
- "أريد قاعة اجتماعات في الساعة 10 صباحاً"
- "هل يمكن استئجار مكتب من الظهر إلى الساعة الثالثة؟"

### Multi-turn Conversation

The chatbot maintains conversation context:
```
User: "Show me offices"
AI: "We have 5 offices available. Which location do you prefer?"
User: "Downtown"
AI: "Great! We have 3 downtown offices. What's your preferred time?"
User: "10 AM for 2 hours"
AI: "Perfect! I found Modern Office Suite available..."
```

### Booking Confirmation

During voice booking:
1. AI confirms office name and location
2. Confirms date and time
3. Confirms total price
4. Gets verbal confirmation
5. Saves booking with "voice-chat" source

---

## Troubleshooting

### Microphone Not Working

**Problem:** "No microphone detected" error

**Solutions:**
1. Check browser permission
   - Chrome: Settings → Privacy → Site Settings → Microphone
   - Firefox: Preferences → Privacy → Permissions
   - Safari: System Preferences → Security & Privacy → Microphone

2. Test microphone
   - Use other voice apps first
   - Check if microphone is connected
   - Try different browser

3. Check internet connection
   - Voice features require internet
   - Restart browser if connection poor

### Speech Recognition Not Working

**Problem:** "Speaking but nothing happens"

**Solutions:**
1. Speak more clearly and slowly
2. Check background noise
3. Ensure language is set correctly
4. Try in a quieter environment

### Speech Synthesis Issues

**Problem:** "AI not speaking"

**Solutions:**
1. Check browser volume
2. Try different volume in app
3. Check if browser has speech synthesis enabled
4. Restart browser

### Booking Fails via Voice

**Problem:** "Can't book through voice chat"

**Solutions:**
1. Verify date/time are within business hours (8 AM - 4 PM)
2. Check if office is available
3. Ensure proper format: "tomorrow 10 AM for 2 hours"
4. Try text chat as alternative

---

## Best Practices

### For Best Voice Recognition

1. **Speak clearly and naturally**
   - Don't rush
   - Pronounce words distinctly
   - Use natural pauses

2. **Minimize background noise**
   - Close windows and doors
   - Use quality microphone
   - Speak at normal volume

3. **Structure your requests**
   - "I want to book an office"
   - "Tomorrow" or specific date
   - "10 AM to 12 PM" or "for 2 hours"
   - Good: "Book office for tomorrow 10 AM for 2 hours"
   - Better: "I'd like to book an office for tomorrow starting at 10 AM for 2 hours"

### For Best User Experience

1. **Use headphones** for clearer audio
2. **Grant microphone permission** on first use
3. **Test voice** in Settings if unsure
4. **Start simple** - let AI guide the conversation
5. **Confirm details** before booking

---

## Privacy & Security

### What Happens to Your Voice?

1. **Audio Recording:** Stays in your browser
2. **Transcription:** Text is sent to server
3. **Storage:** Only booking data stored
4. **Deletion:** Conversation history cleared after session
5. **HTTPS:** All data encrypted in transit

### Data Protection

- No permanent audio files stored
- Chat history cleared on logout
- Booking data stored with user consent
- GDPR compliant
- No third-party audio processing (by default)

---

## Integrations

### Current Integration
- ✅ OpenAI GPT-3.5-turbo (AI responses)
- ✅ Web Speech API (browser voice)

### Optional Integrations (Production)
- 🔧 Twilio (phone calls)
- 🔧 Google Cloud Speech-to-Text (better accuracy)
- 🔧 AWS Polly (advanced speech synthesis)
- 🔧 Azure Speech Services (multilingual)

---

## API Reference

### Voice Chat Frontend

**VoiceChatBot Component:**
```jsx
import VoiceChatBot from './components/VoiceChatBot';

<VoiceChatBot language="en" userId={userId} />
```

**Phone Chat Frontend:**
```jsx
import PhoneChatBot from './components/PhoneChatBot';

<PhoneChatBot language="en" userId={userId} />
```

**Voice Utilities:**
```javascript
import { 
  initSpeechRecognition,
  initSpeechSynthesis,
  speakText,
  checkVoiceSupport 
} from './utils/voiceUtils';

// Check browser support
const support = checkVoiceSupport();
console.log(support.speechRecognition); // true/false

// Speak text
speakText("Your booking is confirmed", "en", () => {
  console.log("Speech finished");
});
```

---

## Limitations & Known Issues

### Browser Limitations
- Firefox: Speech-to-text limited to certain locales
- Safari on iOS: May require HTTPS
- Android: Works best in Chrome

### Technical Limitations
- Max recording length: ~30 seconds (varies by browser)
- Internet required for AI processing
- HTTPS required for microphone access
- One conversation at a time

### Demo Limitations
- Phone calls are simulated (unless Twilio enabled)
- No real voicemail or call callback
- Limited voice command parsing (use natural language)

---

## Future Enhancements

- [ ] Real-time speech-to-text streaming
- [ ] Better accent/dialect support
- [ ] Voice biometric authentication
- [ ] Call recording and transcription
- [ ] Multi-language real-time translation
- [ ] Voice analytics and insights
- [ ] Advanced NLP for booking prediction
- [ ] Integration with more phone services
- [ ] WhatsApp voice message support
- [ ] Assistant customization (voice personality)

---

## Support

For voice-related issues:
1. Check browser compatibility
2. Review troubleshooting section
3. Test in different browser
4. Check console for errors (F12)
5. Try text chat alternative

---

**Last Updated:** June 8, 2026
**Version:** 1.0.0
