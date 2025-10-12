require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const User = require('./src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testData = async () => {
  try {
    console.log('🔍 Testing data...');
    
    // Find user
    const user = await User.findOne({ email: 'lephambinh05@gmail.com' });
    console.log('👤 User found:', user ? user.email : 'Not found');
    
    if (user) {
      // Find courses
      const courses = await Course.find({ userId: user._id });
      console.log('📚 Courses found:', courses.length);
      
      courses.forEach(course => {
        console.log(`  - ${course.name} (${course.category})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

const main = async () => {
  await connectDB();
  await testData();
};

main();
