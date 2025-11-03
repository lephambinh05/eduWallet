const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkAllCompleted() {
  try {
    await mongoose.connect(DB_URI);
    
    const studentId = '690302badd7c9774cfd2a6a7';
    
    const ccs = await CompletedCourse.find({ userId: studentId }).sort({ createdAt: -1 });
    
    console.log(`\n📊 ALL COMPLETED COURSES FOR STUDENT: ${studentId}\n`);
    console.log(`Total: ${ccs.length}\n`);
    
    ccs.forEach((c, i) => {
      console.log(`${i+1}. ${c.name}`);
      console.log(`   Score: ${c.score}/100`);
      console.log(`   Grade: ${c.grade}`);
      console.log(`   Issuer ID: ${c.issuerId}`);
      console.log(`   Enrollment: ${c.enrollmentId}`);
      console.log('');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllCompleted();
