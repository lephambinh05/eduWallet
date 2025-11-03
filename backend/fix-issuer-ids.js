const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function fixIssuerIds() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    const wrongIssuerId = '6902fb27137fbb370d9a8642'; // user ID
    const correctIssuerId = '690312ac7814790e3335d7ec'; // partner ID

    // Update all courses with wrong issuer ID
    const result = await CompletedCourse.updateMany(
      { issuerId: wrongIssuerId },
      { $set: { issuerId: correctIssuerId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} courses`);
    console.log(`   Changed issuer ID from ${wrongIssuerId}`);
    console.log(`   to ${correctIssuerId}\n`);

    // Show all courses
    const all = await CompletedCourse.find({ userId: '690302badd7c9774cfd2a6a7' }).sort({ createdAt: -1 });
    console.log(`📊 All completed courses (${all.length}):\n`);
    all.forEach((c, i) => {
      console.log(`${i+1}. ${c.name}`);
      console.log(`   Issuer ID: ${c.issuerId}`);
      console.log(`   Score: ${c.score}/100, Grade: ${c.grade}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Done! Now refresh http://localhost:3002/completed-new.html');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIssuerIds();
