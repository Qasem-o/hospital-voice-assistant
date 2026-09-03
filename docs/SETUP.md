# Setup and Installation Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (comes with Node.js)
- **MongoDB** running locally or a MongoDB Atlas account ([Get started](https://www.mongodb.com/cloud/atlas))
- **OpenAI API Key** ([Get API Key](https://platform.openai.com/api-keys))
- **Git** for version control

---

## Step 1: Clone or Download Project

```bash
# If cloning from git (if applicable)
git clone <repository-url>
cd office-rental-booking-app

# Or navigate to your existing project folder
cd /path/to/office-rental-booking-app
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install all required packages:
- express - Web framework
- mongoose - MongoDB driver
- openai - OpenAI API client
- cors - Cross-origin requests
- bcryptjs - Password hashing
- jsonwebtoken - Authentication tokens
- dotenv - Environment variables

### 2.3 Create Environment File
```bash
cp .env.example .env
```

### 2.4 Configure Environment Variables

Edit `.env` file with your settings:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/office-rental

# Option 2: MongoDB Atlas Cloud
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/office-rental

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# AI Integration
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Getting Your OpenAI API Key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy and paste it in the `.env` file

### 2.5 MongoDB Setup

**Option 1: Local MongoDB**
```bash
# If you don't have MongoDB installed:
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Then verify it's running
mongo
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a cluster
4. Get connection string
5. Add to `.env` file

### 2.6 Start Backend Server

**Development Mode (with hot reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
```
MongoDB connected
Server running on port 5000
```

### 2.7 Test Backend

Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-06-08T12:00:00Z"
}
```

---

## Step 3: Frontend Setup

### 3.1 Open New Terminal and Navigate to Frontend
```bash
# From project root
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install:
- react - UI framework
- react-dom - React rendering
- axios - HTTP client
- react-router-dom - Routing
- Tailwind CSS - Styling
- Vite - Build tool

### 3.3 Create Environment File (Optional)
```bash
cp .env.example .env
```

The frontend is pre-configured to connect to `http://localhost:5000/api`

### 3.4 Start Frontend Development Server
```bash
npm run dev
```

You should see:
```
VITE v4.3.9  ready in 123 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

---

## Step 4: Verify Everything is Working

### 4.1 Open Browser
Go to [http://localhost:3000](http://localhost:3000)

You should see the Office Rental Booking App login page.

### 4.2 Create Test Account

1. Click "Register" or toggle to register mode
2. Enter sample data:
   ```
   Name: John Doe
   Email: john@example.com
   Phone: +1234567890
   Password: test123
   Language: English
   ```
3. Click Register

### 4.3 Add Sample Offices

Open a new terminal and run:

```bash
# Enter backend directory
cd backend

# Add sample office data using curl
curl -X POST http://localhost:5000/api/offices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modern Office Suite",
    "description": "Fully equipped office with high-speed internet",
    "location": "Downtown Dubai",
    "capacity": 4,
    "pricePerHour": 50,
    "amenities": ["WiFi", "Parking", "Meeting Room", "Coffee"]
  }'

# Add another office
curl -X POST http://localhost:5000/api/offices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creative Studio",
    "description": "Perfect for design and creative work",
    "location": "Business Bay",
    "capacity": 6,
    "pricePerHour": 75,
    "amenities": ["WiFi", "Projector", "Whiteboard", "Kitchen"]
  }'
```

### 4.4 Test Booking Flow

1. Log in with your test account
2. Click "Browse Offices"
3. Select an office
4. Choose date and time
5. Select duration
6. Click "Book Now"

### 4.5 Test AI Chat

1. Click "AI Chat" tab
2. Type a message like: "I want to book an office"
3. Chat with the AI assistant

---

## Development Workflow

### Terminal 1 - Backend Development
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend Development
```bash
cd frontend
npm run dev
```

### Terminal 3 - MongoDB (if running locally)
```bash
# Run after starting in another terminal
mongod
```

---

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

Creates optimized files in `frontend/dist/`

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "office-rental-api"
   ```

---

## Troubleshooting

### Issue: "MongoDB connection failed"
**Solution:**
- Check MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist and connection string

### Issue: "OPENAI_API_KEY not found"
**Solution:**
- Ensure you added it to `.env` file
- Get key from https://platform.openai.com/api-keys
- Restart backend after updating `.env`

### Issue: Port 5000 or 3000 already in use
**Solution:**
- Change PORT in backend `.env`
- Change port in frontend `vite.config.js`
- Or kill existing process

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running: `http://localhost:5000/api/health`
- Check `proxy` in `frontend/vite.config.js`
- Check browser console for CORS errors

### Issue: "npm: command not found"
**Solution:**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

---

## Database Backup

### Backup MongoDB (local)
```bash
mongodump --db office-rental --out ./backup
```

### Restore MongoDB (local)
```bash
mongorestore --db office-rental ./backup/office-rental
```

---

## Performance Tips

1. **Add MongoDB Indexes:**
   ```bash
   # In MongoDB shell
   use office-rental
   db.bookings.createIndex({ "officeId": 1, "startTime": 1 })
   db.users.createIndex({ "email": 1 })
   ```

2. **Enable Caching** in frontend for API responses

3. **Optimize Images** for office listings

4. **Use CDN** for static assets in production

---

## Next Steps

1. ✅ Setup complete! Start developing
2. 📚 Read [API.md](./API.md) for endpoint documentation
3. 🎨 Customize styling in `frontend/src/app.css`
4. 🤖 Enhance AI prompts in `backend/src/controllers/aiController.js`
5. 💾 Set up database backups
6. 🚀 Deploy to production (Heroku, AWS, DigitalOcean, etc.)

---

## Support

For issues:
1. Check the error messages carefully
2. Review the troubleshooting section
3. Check terminal output for detailed errors
4. Ensure all prerequisites are installed

---

**Last Updated:** June 8, 2026
**Version:** 1.0.0
