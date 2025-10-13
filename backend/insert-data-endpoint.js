// Simple endpoint to insert portfolio data
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eduwallet');

// Simple schemas
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String
});

const courseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  courseName: String,
  grade: String,
  gpa: Number
});

const certificateSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  issuer: String,
  issueDate: Date
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);

// Endpoint to insert data
app.post('/insert-portfolio-data', async (req, res) => {
  try {
    console.log('🚀 Starting portfolio data insertion...');

    // Find user
    const user = await User.findOne({ email: 'lephambinh05@gmail.com' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Clear existing data
    await Course.deleteMany({ userId: user._id });
    await Certificate.deleteMany({ userId: user._id });

    // Insert courses
    const courses = [
      { userId: user._id, courseName: 'Lập trình cơ bản', grade: 'A', gpa: 4.0 },
      { userId: user._id, courseName: 'Cấu trúc dữ liệu', grade: 'A-', gpa: 3.7 },
      { userId: user._id, courseName: 'Cơ sở dữ liệu', grade: 'A+', gpa: 4.0 },
      { userId: user._id, courseName: 'Mạng máy tính', grade: 'B+', gpa: 3.3 },
      { userId: user._id, courseName: 'Phát triển web', grade: 'A', gpa: 4.0 },
      { userId: user._id, courseName: 'Trí tuệ nhân tạo', grade: 'A-', gpa: 3.7 }
    ];

    await Course.insertMany(courses);
    console.log('✅ Inserted 6 courses');

    // Insert certificates
    const certificates = [
      { userId: user._id, title: 'Google Cloud Architect', issuer: 'Google', issueDate: new Date('2024-01-15') },
      { userId: user._id, title: 'Google Analytics', issuer: 'Google', issueDate: new Date('2023-11-20') },
      { userId: user._id, title: 'IELTS Academic', issuer: 'British Council', issueDate: new Date('2023-08-15') },
      { userId: user._id, title: 'React Developer', issuer: 'Udemy', issueDate: new Date('2024-02-20') },
      { userId: user._id, title: 'Node.js Guide', issuer: 'Udemy', issueDate: new Date('2024-01-10') },
      { userId: user._id, title: 'Machine Learning', issuer: 'Coursera', issueDate: new Date('2024-03-15') },
      { userId: user._id, title: 'Deep Learning', issuer: 'Coursera', issueDate: new Date('2024-04-20') },
      { userId: user._id, title: 'Bachelor of Computer Science', issuer: 'UIT', issueDate: new Date('2024-06-15') }
    ];

    await Certificate.insertMany(certificates);
    console.log('✅ Inserted 8 certificates');

    res.json({
      success: true,
      message: 'Portfolio data inserted successfully',
      data: {
        courses: courses.length,
        certificates: certificates.length
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3004, () => {
  console.log('🚀 Data insertion server running on port 3004');
  console.log('📝 POST /insert-portfolio-data to insert data');
});
