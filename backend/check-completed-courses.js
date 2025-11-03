const mongoose = require('mongoose');
const Purchase = require('./src/models/Purchase');
const Enrollment = require('./src/models/Enrollment');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkCompletedCourses() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    const studentId = '690302badd7c9774cfd2a6a7';
    const partnerId = '690312ac7814790e3335d7ec'; // Website 1

    console.log('='.repeat(60));
    console.log('📊 CHECKING COMPLETED COURSES');
    console.log('='.repeat(60));
    console.log(`Student ID: ${studentId}`);
    console.log(`Partner ID: ${partnerId}\n`);

    // Find all completed courses for this student from this partner
    const completedCourses = await CompletedCourse.find({
      userId: studentId,
      issuerId: partnerId
    }).sort({ createdAt: -1 });

    console.log(`Found ${completedCourses.length} completed courses:\n`);

    if (completedCourses.length === 0) {
      console.log('❌ NO COMPLETED COURSES FOUND!');
      console.log('\nChecking enrollments instead...\n');
      
      const enrollments = await Enrollment.find({
        user: studentId,
        seller: partnerId
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${enrollments.length} enrollments:`);
      enrollments.forEach((enrollment, idx) => {
        console.log(`\n${idx + 1}. Enrollment ID: ${enrollment._id}`);
        console.log(`   Course: ${enrollment.courseTitle}`);
        console.log(`   Status: ${enrollment.status}`);
        console.log(`   Progress: ${enrollment.progressPercent}%`);
        console.log(`   Time: ${Math.round(enrollment.timeSpentSeconds / 60)} minutes`);
        console.log(`   Completed At: ${enrollment.completedAt || 'N/A'}`);
      });
      
      console.log('\n⚠️ Enrollments exist but no CompletedCourse records!');
      console.log('This means the backend did not create CompletedCourse when status=completed.');
    } else {
      completedCourses.forEach((course, idx) => {
        console.log(`${idx + 1}. ${course.name}`);
        console.log(`   Score: ${course.score}/100`);
        console.log(`   Grade: ${course.grade}`);
        console.log(`   Issuer: ${course.issuer}`);
        console.log(`   Date: ${course.issueDate}`);
        console.log(`   Enrollment ID: ${course.enrollmentId}`);
        console.log('');
      });
    }

    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCompletedCourses();
