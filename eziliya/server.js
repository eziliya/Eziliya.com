const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eziliya';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobileRegisterNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['office-engineer', 'site-engineer', 'technical-engineer', 'valuer', 'sales-team']
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  profilePhoto: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// OTP Storage (in-memory for demo, use Redis in production)
const otpStore = new Map();

// ==================== ROUTES ====================

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Send OTP (Mock implementation - integrate with SMS service)
app.post('/send-otp', async (req, res) => {
  try {
    const { mobileRegisterNumber } = req.body;

    if (!mobileRegisterNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile register number is required'
      });
    }

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(mobileRegisterNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile register number format'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiry
    otpStore.set(mobileRegisterNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`📱 OTP for ${mobileRegisterNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production - only for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  try {
    const { mobileRegisterNumber, otp } = req.body;

    if (!mobileRegisterNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile register number and OTP are required'
      });
    }

    const storedOtpData = otpStore.get(mobileRegisterNumber);

    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(mobileRegisterNumber);
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP verified successfully
    otpStore.delete(mobileRegisterNumber);

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Register User
app.post('/register', async (req, res) => {
  try {
    const { name, mobileRegisterNumber, password, role, otpVerified } = req.body;

    // Validate required fields
    if (!name || !mobileRegisterNumber || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(mobileRegisterNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid mobile register number format' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobileRegisterNumber });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile register number already registered' 
      });
    }

    // Create new user
    const user = new User({
      name,
      mobileRegisterNumber,
      password,
      role,
      otpVerified: otpVerified || false
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        mobileRegisterNumber: user.mobileRegisterNumber,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      mobileRegisterNumber: user.mobileRegisterNumber,
      role: user.role,
      otpVerified: user.otpVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      token,
      user: userData
    });

    console.log(`✅ New user registered: ${mobileRegisterNumber} (${role})`);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login User
app.post('/login', async (req, res) => {
  try {
    const { mobileRegisterNumber, password } = req.body;

    // Validate required fields
    if (!mobileRegisterNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile register number and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ mobileRegisterNumber });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile register number or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile register number or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        mobileRegisterNumber: user.mobileRegisterNumber,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      mobileRegisterNumber: user.mobileRegisterNumber,
      role: user.role,
      otpVerified: user.otpVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

    console.log(`✅ User logged in: ${mobileRegisterNumber}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Get User Profile (Protected Route)
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});

// Made with Bob
