# Voice Chat Quick Start

## 🎯 Get Started in 2 Minutes

### Step 1: Start the App
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev
```

### Step 2: Log In
1. Open http://localhost:3000
2. Register or login with test account
3. Click "🎙️ Voice" tab

### Step 3: Talk to AI
1. Click "Start Listening" 🎤
2. Speak your request: *"I want to book an office for 2 hours tomorrow"*
3. Click "Send" ✓
4. Listen to AI response 🔊

---

## Example Voice Commands

### Booking
- "Book me an office for tomorrow 10 AM"
- "I need a meeting room for 2 hours"
- "Reserve downtown office, 1 PM, 3 hours"

### Arabic
- "احجز لي مكتب غدا الساعة 10 صباحاً"
- "أريد قاعة اجتماعات لمدة ساعتين"
- "احجز مكتب وسط المدينة"

---

## Phone Call Feature

### Demo:
1. Click "📞 Phone" tab
2. Enter phone number
3. Click "Start Call"

### Real Phones (Twilio):
```
1. Get Twilio account: twilio.com
2. Add to .env:
   TWILIO_ACCOUNT_SID=ACxxx
   TWILIO_AUTH_TOKEN=xxx
   TWILIO_PHONE_NUMBER=+1234567890
3. Enable in voiceController.js
4. Deploy with HTTPS
```

---

## Troubleshooting

**No microphone?**
- Allow permission when browser asks
- Check browser settings
- Try Chrome/Edge/Safari

**Not hearing audio?**
- Check volume
- Try headphones
- Enable speaker in browser

**Can't understand?**
- Speak clearly
- Reduce background noise
- See VOICE.md for best practices

---

## Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome  | ✅ Best | Perfect support |
| Firefox | ⚠️ Limited | Speech-to-text may not work |
| Safari  | ✅ Full | iOS & Mac |
| Edge    | ✅ Full | Based on Chrome |
| Mobile  | ✅ Full | Android & iOS |

---

## What's Happening

```
You Speak
   ↓
Browser hears you
   ↓
Converts speech to text
   ↓
Sends to server
   ↓
AI (OpenAI) processes
   ↓
Sends response back
   ↓
Browser reads response
   ↓
You hear AI voice
```

---

## Next Steps

1. ✅ Try voice chat
2. 📖 Read [VOICE.md](../docs/VOICE.md) for details
3. 🤖 Enable Twilio for real phone calls
4. 🎯 Explore other features

---

**Ready to talk?** Click the 🎙️ button! 🚀
