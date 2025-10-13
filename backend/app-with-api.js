require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes and models
const portfolioRoutes = require('./src/routes/portfolio');
const walletRoutes = require('./routes/wallet');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EduWallet Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/wallet', walletRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// User model is imported from src/models/User.js

// API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, dateOfBirth, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      dateOfBirth,
      role: role || 'student'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken: token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken: token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    // Check for valid authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/users/wallet', async (req, res) => {
  try {
    const { walletAddress, chainId, networkName, isConnected, connectedAt } = req.body;
    
    // Check for valid authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update wallet information
    user.walletAddress = walletAddress.toLowerCase();
    user.walletInfo = {
      chainId: chainId || null,
      networkName: networkName || null,
      isConnected: isConnected || true,
      connectedAt: connectedAt ? new Date(connectedAt) : new Date(),
      lastActivity: new Date()
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Wallet connected and saved to database successfully',
      data: { 
        walletAddress: user.walletAddress,
        walletInfo: user.walletInfo
      }
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    
    // Handle JWT specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.delete('/api/users/wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    // Find user by wallet address
    let user;
    if (walletAddress) {
      user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Clear wallet information
    user.walletAddress = null;
    user.walletInfo = {
      chainId: null,
      networkName: null,
      isConnected: false,
      connectedAt: null,
      lastActivity: new Date()
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Wallet disconnected and database updated successfully'
    });
  } catch (error) {
    console.error('Disconnect wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get wallet information
app.get('/api/users/wallet', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }
    
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: {
        walletAddress: user.walletAddress,
        walletInfo: user.walletInfo
      }
    });
  } catch (error) {
    console.error('Get wallet info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get current user's wallet information
app.get('/api/users/me/wallet', async (req, res) => {
  try {
    // Check for valid authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Current user wallet information retrieved successfully',
      data: {
        walletAddress: user.walletAddress,
        walletInfo: user.walletInfo
      }
    });
  } catch (error) {
    console.error('Get current user wallet info error:', error);
    
    // Handle JWT specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    
    console.log('✅ MongoDB connected successfully!');
    
    // Start server
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`🚀 EduWallet Backend Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
      console.log(`👤 User endpoints: http://localhost:${PORT}/api/users/*`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database and start server
connectDB();
