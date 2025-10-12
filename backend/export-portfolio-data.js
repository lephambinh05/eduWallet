require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

// Import models
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const SimpleCertificate = require('./src/models/SimpleCertificate');
const SimpleBadge = require('./src/models/SimpleBadge');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const exportData = async () => {
  try {
    console.log('📤 Exporting portfolio data...');
    
    // Find user
    const user = await User.findOne({ email: 'lephambinh05@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Find courses, certificates, and badges
    const courses = await Course.find({ userId: user._id });
    const certificates = await SimpleCertificate.find({ userId: user._id });
    const badges = await SimpleBadge.find({ userId: user._id });
    
    // Calculate statistics
    const statistics = {
      totalCourses: courses.length,
      totalCertificates: certificates.length,
      totalBadges: badges.length,
      gpa: user.academicInfo?.gpa || 0,
      totalCredits: user.academicInfo?.totalCredits || 0,
      completedCredits: user.academicInfo?.completedCredits || 0,
      averageScore: courses.length > 0 ? 
        Math.round(courses.reduce((sum, course) => sum + (course.score || 0), 0) / courses.length) : 0,
      completionRate: courses.length > 0 ? 
        Math.round((courses.filter(c => c.status === 'Completed').length / courses.length) * 100) : 0
    };

    const portfolioData = {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        studentId: user.studentId,
        academicInfo: user.academicInfo
      },
      courses: courses.map(course => ({
        id: course._id.toString(),
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
      certificates: certificates.map(cert => ({
        id: cert._id.toString(),
        name: cert.title,
        description: cert.description,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        category: cert.category,
        level: cert.level,
        score: cert.score,
        grade: cert.grade,
        verificationUrl: cert.verificationUrl,
        imageUrl: cert.imageUrl
      })),
      badges: badges.map(badge => ({
        id: badge._id.toString(),
        name: badge.title,
        description: badge.description,
        issuer: badge.issuer,
        issueDate: badge.earnedDate,
        category: badge.category,
        level: badge.level,
        points: badge.points,
        rarity: badge.rarity,
        iconUrl: badge.iconUrl
      })),
      statistics
    };

    // Write to file
    const outputPath = '../src/data/portfolioData.json';
    fs.writeFileSync(outputPath, JSON.stringify(portfolioData, null, 2));
    
    console.log('✅ Portfolio data exported successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`🏆 Certificates: ${certificates.length}`);
    console.log(`🎖️  Badges: ${badges.length}`);
    console.log(`👤 User: ${user.email}`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

const main = async () => {
  await connectDB();
  await exportData();
};

main();
