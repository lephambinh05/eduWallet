// Manual import script - Copy and paste this into Node.js console or run as script
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eduwallet')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));

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
  gpa: Number,
  semester: String
}, { timestamps: true });

const certificateSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  issuer: String,
  issueDate: Date,
  category: String,
  score: Number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);

// Manual import function
async function manualImport() {
  try {
    console.log('🚀 Starting manual import...');

    // Find user
    const user = await User.findOne({ email: 'lephambinh05@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);

    // Clear existing data
    await Course.deleteMany({ userId: user._id });
    await Certificate.deleteMany({ userId: user._id });
    console.log('🧹 Cleared existing data');
    
    // Wait a bit to ensure deletion is complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Insert courses
    const courses = [
      { userId: user._id, courseName: 'Lập trình cơ bản', grade: 'A', gpa: 4.0, semester: 'Fall 2023' },
      { userId: user._id, courseName: 'Cấu trúc dữ liệu', grade: 'A-', gpa: 3.7, semester: 'Fall 2023' },
      { userId: user._id, courseName: 'Cơ sở dữ liệu', grade: 'A+', gpa: 4.0, semester: 'Spring 2024' },
      { userId: user._id, courseName: 'Mạng máy tính', grade: 'B+', gpa: 3.3, semester: 'Spring 2024' },
      { userId: user._id, courseName: 'Phát triển web', grade: 'A', gpa: 4.0, semester: 'Fall 2024' },
      { userId: user._id, courseName: 'Trí tuệ nhân tạo', grade: 'A-', gpa: 3.7, semester: 'Fall 2024' }
    ];

    await Course.insertMany(courses);
    console.log('✅ Inserted 6 courses');

    // Insert certificates
    const certificates = [
      { userId: user._id, title: 'Google Cloud Architect', issuer: 'Google', issueDate: new Date('2024-01-15'), category: 'Cloud Computing', score: 95 },
      { userId: user._id, title: 'Google Analytics', issuer: 'Google', issueDate: new Date('2023-11-20'), category: 'Digital Marketing', score: 92 },
      { userId: user._id, title: 'IELTS Academic', issuer: 'British Council', issueDate: new Date('2023-08-15'), category: 'Language', score: 7.5 },
      { userId: user._id, title: 'React Developer', issuer: 'Udemy', issueDate: new Date('2024-02-20'), category: 'Web Development', score: 98 },
      { userId: user._id, title: 'Node.js Guide', issuer: 'Udemy', issueDate: new Date('2024-01-10'), category: 'Backend Development', score: 89 },
      { userId: user._id, title: 'Machine Learning', issuer: 'Coursera', issueDate: new Date('2024-03-15'), category: 'Data Science', score: 92 },
      { userId: user._id, title: 'Deep Learning', issuer: 'Coursera', issueDate: new Date('2024-04-20'), category: 'AI', score: 88 },
      { userId: user._id, title: 'Bachelor of Computer Science', issuer: 'UIT', issueDate: new Date('2024-06-15'), category: 'Academic Degree', score: 3.8 }
    ];

    await Certificate.insertMany(certificates);
    console.log('✅ Inserted 8 certificates');

    console.log('🎉 Manual import completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
manualImport();
