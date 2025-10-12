require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const portfolioRoutes = require('./src/routes/portfolio');

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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Simple User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  role: { type: String, default: 'student' },
  walletAddress: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

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

    // Create user
    const user = new User({
      username,
      email,
      password, // In production, hash this password
      firstName,
      lastName,
      dateOfBirth,
      role: role || 'student'
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token: 'mock-jwt-token', // In production, generate real JWT
        refreshToken: 'mock-refresh-token'
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

    // Find user
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
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

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
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
    // Mock user for testing
    const mockUser = {
      _id: 'mock-user-id',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      walletAddress: null,
      isActive: true
    };

    res.json({
      success: true,
      data: { user: mockUser }
    });
  } catch (error) {
    console.error('Get profile error:', error);
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
    
    // Find user by wallet address or get from token (if authenticated)
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
