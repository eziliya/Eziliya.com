# 🚀 MongoDB Backend Setup Guide

## Problem Fixed
✅ **User signup data now stores in MongoDB database instead of only localStorage**

## What Was Created

### 1. Backend Server (`server.js`)
- Express.js server with MongoDB connection
- User authentication with JWT tokens
- Password hashing with bcrypt
- OTP verification system
- CORS enabled for frontend communication

### 2. API Endpoints

#### Authentication Endpoints:
- `POST /register` - Register new user (saves to MongoDB)
- `POST /login` - Login user (checks MongoDB)
- `GET /profile` - Get user profile (protected route)

#### OTP Endpoints:
- `POST /send-otp` - Send OTP to mobile number
- `POST /verify-otp` - Verify OTP

#### Health Check:
- `GET /health` - Check server and MongoDB status

### 3. Configuration Files
- `.env.example` - Environment variables template
- `backend-package.json` - Backend dependencies

## 📋 Setup Instructions

### Step 1: Install MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Use it in `.env` file

**Option B: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

### Step 2: Setup Backend

1. **Copy environment file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   # For MongoDB Atlas (Cloud)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eziliya
   
   # OR for Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/eziliya
   
   JWT_SECRET=your-super-secret-key-change-this
   PORT=5000
   NODE_ENV=development
   ```

3. **Install backend dependencies:**
   ```bash
   npm install --save express mongoose cors bcryptjs jsonwebtoken dotenv
   npm install --save-dev nodemon
   ```

4. **Start backend server:**
   ```bash
   # Development mode (auto-restart)
   npm run dev
   
   # OR Production mode
   npm start
   ```

   You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 5000
   📡 API URL: http://localhost:5000
   ```

### Step 3: Configure Frontend

1. **Update `.env` in project root:**
   ```env
   VITE_SERVER_URL=http://localhost:5000
   ```

2. **Restart frontend:**
   ```bash
   npm run dev
   ```

### Step 4: Test the Integration

1. **Test backend health:**
   Open browser: http://localhost:5000/health
   
   Should show:
   ```json
   {
     "status": "OK",
     "message": "Server is running",
     "mongodb": "Connected"
   }
   ```

2. **Test signup:**
   - Go to http://localhost:5173/signup
   - Fill in the form
   - Click "Sign up"
   - Check browser console - should NOT see "Server registration failed"
   - User data is now saved in MongoDB!

3. **Verify in MongoDB:**
   - MongoDB Atlas: Check "Collections" in your cluster
   - Local MongoDB: Use MongoDB Compass or CLI
   - Database: `eziliya`
   - Collection: `users`
   - You should see your registered user

## 🔍 How It Works Now

### Before (localStorage only):
```
Signup → Try Backend → ❌ Fails → Save to localStorage
Login → Check localStorage → ✅ Works locally only
```

### After (MongoDB):
```
Signup → Backend API → ✅ Save to MongoDB → Return token
Login → Backend API → ✅ Check MongoDB → Return token
```

## 📊 Database Schema

```javascript
User {
  name: String (required)
  mobileRegisterNumber: String (required, unique, 10 digits)
  password: String (required, hashed, min 6 chars)
  role: String (required, enum: office-engineer, site-engineer, etc.)
  otpVerified: Boolean (default: false)
  profilePhoto: String (optional)
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Security Features

✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT token authentication (30-day expiry)
✅ Mobile number validation (10 digits)
✅ Password minimum length (6 characters)
✅ Unique mobile number constraint
✅ Protected routes with JWT middleware

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Backend server not running → Run `npm start` in backend
- Wrong URL in `.env` → Check `VITE_SERVER_URL`
- CORS issue → Backend has CORS enabled, check console

### Error: "MongoDB connection error"
- MongoDB not running → Start MongoDB service
- Wrong connection string → Check `MONGODB_URI` in `.env`
- Network issue → Check internet for MongoDB Atlas

### Error: "Mobile register number already registered"
- User already exists in MongoDB
- Use different mobile number OR
- Delete user from MongoDB and try again

## 📝 Testing Checklist

- [ ] MongoDB is running
- [ ] Backend server is running (port 5000)
- [ ] Frontend is running (port 5173)
- [ ] `.env` file configured with `VITE_SERVER_URL`
- [ ] Health check returns "Connected"
- [ ] Signup creates user in MongoDB
- [ ] Login works with MongoDB credentials
- [ ] Browser console shows no errors

## 🎯 Next Steps

1. **Production Deployment:**
   - Use MongoDB Atlas for production
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Add rate limiting
   - Implement proper OTP service (Twilio, AWS SNS)

2. **Additional Features:**
   - Password reset functionality
   - Email verification
   - Profile photo upload to cloud storage
   - User role management
   - Activity logging

## 📞 Support

If you encounter issues:
1. Check backend console for errors
2. Check browser console for errors
3. Verify MongoDB connection
4. Check `.env` configuration
5. Ensure all dependencies are installed

---

**Status:** ✅ MongoDB integration complete - User data now saves to database!