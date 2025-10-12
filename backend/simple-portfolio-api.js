require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import models
const User = require('./src/models/User');
const Course = require('./src/models/Course');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio API is running!',
    timestamp: new Date().toISOString()
  });
});

// Get portfolio by email
app.get('/api/portfolio/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find user
    const user = await User.findOne({ email }).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find courses
    const courses = await Course.find({ userId: user._id });
    
    // Calculate statistics
    const statistics = {
      totalCourses: courses.length,
      totalCertificates: 0,
      totalBadges: 0,
      gpa: user.academicInfo?.gpa || 0,
      totalCredits: user.academicInfo?.totalCredits || 0,
      completedCredits: user.academicInfo?.completedCredits || 0,
      averageScore: courses.length > 0 ? 
        Math.round(courses.reduce((sum, course) => sum + (course.score || 0), 0) / courses.length) : 0,
      completionRate: courses.length > 0 ? 
        Math.round((courses.filter(c => c.status === 'Completed').length / courses.length) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          studentId: user.studentId,
          academicInfo: user.academicInfo
        },
        courses: courses.map(course => ({
          id: course._id,
          name: course.name,
          description: course.description,
          issuer: course.issuer,
          issueDate: course.issueDate,
          category: course.category,
          level: course.level,
          score: course.score,
          status: course.status,
          progress: course.progress,
          skills: course.skills,
          verificationUrl: course.verificationUrl,
          imageUrl: course.imageUrl
        })),
        certificates: [],
        badges: [],
        statistics
      }
    });
  } catch (error) {
    console.error('Error getting portfolio data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio API server running on port ${PORT}`);
  });
};

startServer();
