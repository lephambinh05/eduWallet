const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkEnrollments() {
  try {
    await mongoose.connect(DB_URI);
    
    const enrollments = [
      '69030da964401b21a712c8ff', // Course 2
      '6903150daca41b1c738a976e'  // Course 1
    ];
    
    console.log('Checking CompletedCourses for enrollments...\n');
    
    for (const enrollmentId of enrollments) {
      const cc = await CompletedCourse.findOne({ enrollmentId });
      console.log(`Enrollment ${enrollmentId}:`, cc ? `EXISTS (score: ${cc.score}, grade: ${cc.grade})` : '❌ NOT FOUND');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEnrollments();
