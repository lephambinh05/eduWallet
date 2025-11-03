/**
 * Check Database for Partner Courses
 * Kiểm tra xem các khóa học đã được lưu vào database chưa
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const PartnerCourse = require('../src/models/PartnerCourse');
const Partner = require('../src/models/Partner');
const Enrollment = require('../src/models/Enrollment');
const Purchase = require('../src/models/Purchase');
const CompletedCourse = require('../src/models/CompletedCourse');

async function checkDatabase() {
  try {
    console.log('\n🔍 CHECKING DATABASE...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check Partner Courses
    console.log('📚 PARTNER COURSES:');
    console.log('='.repeat(60));
    const courses = await PartnerCourse.find()
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Total courses: ${courses.length}\n`);
    
    if (courses.length > 0) {
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Owner: ${course.owner?.email || course.owner?.username || 'N/A'}`);
        console.log(`   Price: ${course.priceEdu} EDU tokens`);
        console.log(`   Link: ${course.link}`);
        console.log(`   Published: ${course.isPublished ? 'Yes' : 'No'}`);
        console.log(`   Created: ${course.createdAt?.toLocaleString() || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No courses found\n');
    }

    // 2. Check Enrollments
    console.log('🎓 ENROLLMENTS:');
    console.log('='.repeat(60));
    const enrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Total enrollments: ${enrollments.length}\n`);
    
    if (enrollments.length > 0) {
      enrollments.forEach((enrollment, index) => {
        console.log(`${index + 1}. ${enrollment.courseTitle || 'N/A'}`);
        console.log(`   ID: ${enrollment._id}`);
        console.log(`   User ID: ${enrollment.user}`);
        console.log(`   Course ID: ${enrollment.itemId}`);
        console.log(`   Status: ${enrollment.status}`);
        console.log(`   Progress: ${enrollment.progressPercent}%`);
        console.log(`   Enrolled: ${enrollment.createdAt?.toLocaleString() || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No enrollments found\n');
    }

    // 3. Check Purchases
    console.log('💰 PURCHASES:');
    console.log('='.repeat(60));
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Total purchases: ${purchases.length}\n`);
    
    if (purchases.length > 0) {
      purchases.forEach((purchase, index) => {
        console.log(`${index + 1}. Purchase ID: ${purchase._id}`);
        console.log(`   User ID: ${purchase.user}`);
        console.log(`   Item ID: ${purchase.itemId}`);
        console.log(`   Amount: ${purchase.amount} EDU tokens`);
        console.log(`   Status: ${purchase.status}`);
        console.log(`   Date: ${purchase.createdAt?.toLocaleString() || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No purchases found\n');
    }

    // 4. Check Completed Courses
    console.log('🏆 COMPLETED COURSES:');
    console.log('='.repeat(60));
    const completedCourses = await CompletedCourse.find()
      .sort({ completedAt: -1 })
      .limit(10);
    
    console.log(`Total completed courses: ${completedCourses.length}\n`);
    
    if (completedCourses.length > 0) {
      completedCourses.forEach((completed, index) => {
        console.log(`${index + 1}. ${completed.courseTitle || 'N/A'}`);
        console.log(`   ID: ${completed._id}`);
        console.log(`   User ID: ${completed.userId}`);
        console.log(`   Enrollment ID: ${completed.enrollmentId}`);
        console.log(`   Grade: ${completed.grade || 'N/A'}`);
        console.log(`   Score: ${completed.score || 'N/A'}`);
        console.log(`   Completed: ${completed.completedAt?.toLocaleString() || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No completed courses found\n');
    }

    // 5. Check Partners
    console.log('🤝 PARTNERS:');
    console.log('='.repeat(60));
    const partners = await Partner.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`Total partners: ${partners.length}\n`);
    
    if (partners.length > 0) {
      partners.forEach((partner, index) => {
        console.log(`${index + 1}. ${partner.name}`);
        console.log(`   ID: ${partner._id}`);
        console.log(`   Owner User ID: ${partner.ownerUserId}`);
        console.log(`   Status: ${partner.status}`);
        console.log(`   API Key: ${partner.apiKey ? '***' + partner.apiKey.slice(-6) : 'Not set'}`);
        console.log(`   Created: ${partner.createdAt?.toLocaleString() || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No partners found\n');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Courses: ${courses.length}`);
    console.log(`Enrollments: ${enrollments.length}`);
    console.log(`Purchases: ${purchases.length}`);
    console.log(`Completed Courses: ${completedCourses.length}`);
    console.log(`Partners: ${partners.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

// Run the check
checkDatabase();
