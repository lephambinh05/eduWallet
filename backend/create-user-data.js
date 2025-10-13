// Simple script to create user data
console.log('🚀 Creating user data...');

// Check if we can connect to MongoDB
const mongoose = require('mongoose');

async function createData() {
  try {
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    // Create simple schemas
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true },
      firstName: String,
      lastName: String
    });

    const courseSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      courseName: String,
      grade: String,
      gpa: Number
    });

    const certificateSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      title: String,
      issuer: String,
      issueDate: Date
    });

    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);
    const Certificate = mongoose.model('Certificate', certificateSchema);

    // Find or create user
    let user = await User.findOne({ email: 'lephambinh05@gmail.com' });
    if (!user) {
      user = new User({
        email: 'lephambinh05@gmail.com',
        firstName: 'Lê Phạm',
        lastName: 'Bình'
      });
      await user.save();
      console.log('✅ Created user:', user.email);
    } else {
      console.log('✅ Found user:', user.email);
    }

    // Clear existing data
    await Course.deleteMany({ userId: user._id });
    await Certificate.deleteMany({ userId: user._id });
    console.log('🧹 Cleared existing data');

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

    // Calculate stats
    const totalCourses = await Course.countDocuments({ userId: user._id });
    const totalCertificates = await Certificate.countDocuments({ userId: user._id });
    const avgGPA = await Course.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, avgGPA: { $avg: '$gpa' } } }
    ]);

    console.log('\n📊 Portfolio Summary:');
    console.log('====================');
    console.log(`👤 User: ${user.email}`);
    console.log(`📚 Courses: ${totalCourses}`);
    console.log(`🏆 Certificates: ${totalCertificates}`);
    console.log(`📈 Average GPA: ${avgGPA[0]?.avgGPA?.toFixed(2) || 'N/A'}`);

    console.log('\n🎉 Data creation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createData();
