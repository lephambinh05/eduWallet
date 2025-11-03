const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function deleteCompletedCourse() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete the Quiz Course 2 completion to test again
    const result = await CompletedCourse.deleteOne({
      userId: '690302badd7c9774cfd2a6a7',
      name: 'Quiz Course 2'
    });

    console.log(`✅ Deleted ${result.deletedCount} course(s)\n`);

    // Show remaining
    const all = await CompletedCourse.find({ userId: '690302badd7c9774cfd2a6a7' }).sort({ createdAt: -1 });
    console.log(`📊 Remaining completed courses (${all.length}):\n`);
    all.forEach((c, i) => {
      console.log(`${i+1}. ${c.name} - Issuer: ${c.issuerId}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Now go to http://localhost:3003 and complete Quiz Course 2 to test!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteCompletedCourse();
