# MongoDB Atlas Setup Guide

## Why MongoDB Atlas?

MongoDB Atlas is a cloud-hosted MongoDB database service that:
- ✅ No local installation required
- ✅ Free tier available (512MB storage)
- ✅ Automatic backups
- ✅ High availability
- ✅ Works immediately with your backend

---

## Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Start Free" or "Create Account"

2. **Sign Up:**
   - Use your email or Google account
   - Create a password
   - Verify your email

3. **Create Cluster:**
   - Click "Create" on the "Create a Cluster" page
   - Select **Free Tier** (M0 Sandbox)
   - Choose cloud provider (AWS, Google Cloud, or Azure)
   - Choose region closest to you
   - Click "Create Cluster"

4. **Set Up Authentication:**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Username: `your_username` (e.g., `qasem`)
   - Password: Create a strong password
   - Roles: Select "Read and write to any database"
   - Click "Add User"

5. **Configure Network Access:**
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Click "Connect your application"
   - Select "Node.js"
   - Copy the connection string

---

## Step 2: Update Backend Configuration

1. **Open your `.env` file:**
   ```bash
   cd /Users/qasem/Desktop/voice/backend
   nano .env
   ```

2. **Replace the `MONGODB_URI` with your actual connection string:**
   ```env
   MONGODB_URI=mongodb+srv://myuser:your_password@cluster0.mongodb.net/hospital-booking?retryWrites=true&w=majority
   ```

   **Important:**
   - Replace `qasem` with your username
   - Replace `your_password` with your actual password
   - Replace `cluster0.mongodb.net` with your actual cluster name

3. **Save and exit:**
   - Press `Ctrl+O`, then `Enter`
   - Press `Ctrl+X` to exit

---

## Step 3: Start Backend Server

```bash
cd /Users/qasem/Desktop/voice/backend
npm start
```

You should see:
```
Server running on port 8000
MongoDB connected successfully
```

---

## Step 4: Test the Connection

### Using curl:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status":"ok","database":"connected"}
```

### Using Postman:
1. Create new request: `GET http://localhost:8000/api/health`
2. Send request
3. Check response

---

## Troubleshooting

### Connection Refused Error
**Problem:** `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Verify connection string is correct
3. Check if cluster is running (it should be in Atlas dashboard)

### Authentication Error
**Problem:** `MongoServerError: Authentication failed`

**Solutions:**
1. Verify username and password in `.env`
2. Check if user has correct roles in "Database Access"
3. Ensure password doesn't have special characters that need escaping

### Timeout Error
**Problem:** `MongoServerSelectionError: connect timeout`

**Solutions:**
1. Check your internet connection
2. Verify region selection in Atlas (choose closest to you)
3. Wait a few minutes for cluster to initialize

---

## Free Tier Limitations

- **Storage:** 512MB
- **Operations:** 5000 units/month
- **Perfect for:** Development and testing
- **Upgrade:** Easy to upgrade when needed

---

## Next Steps

1. ✅ Create MongoDB Atlas account
2. ✅ Create free cluster
3. ✅ Set up authentication
4. ✅ Get connection string
5. ✅ Update `.env` file
6. ✅ Start backend server
7. ✅ Test connection

---

## Quick Reference

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://myuser:myPassword123@cluster0.mongodb.net/hospital-booking?retryWrites=true&w=majority
```

**Common Issues:**
- Missing `mongodb+srv://` prefix
- Wrong cluster name
- Incorrect password
- IP whitelist not configured

---

**Last Updated:** June 8, 2026