const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkEnrollment() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // The new enrollment ID from test
    const enrollmentId = '6903150daca41b1c738a976e';
    
    console.log('Checking for CompletedCourse with enrollment:', enrollmentId);
    
    const completedCourse = await CompletedCourse.findOne({ enrollmentId });
    
    if (completedCourse) {
      console.log('\n✅ FOUND CompletedCourse:');
      console.log('   Name:', completedCourse.name);
      console.log('   Score:', completedCourse.score);
      console.log('   Grade:', completedCourse.grade);
    } else {
      console.log('\n❌ NO CompletedCourse found for this enrollment!');
      console.log('\nThis means the backend did NOT create CompletedCourse.');
      console.log('Check backend console for errors.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEnrollment();
