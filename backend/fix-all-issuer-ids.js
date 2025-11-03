const mongoose = require('mongoose');
const CompletedCourse = require('./src/models/CompletedCourse');
const PartnerCourse = require('./src/models/PartnerCourse');
const User = require('./src/models/User');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

// Owner ID → Partner ID mapping
const ownerToPartnerMap = {
  '6902fb27137fbb370d9a8642': '690312ac7814790e3335d7ec', // Video
  '6902fb28137fbb370d9a8646': '690312ac7814790e3335d7ef', // Quiz
  '6902fb28137fbb370d9a864a': '690312ac7814790e3335d7f2'  // Hybrid
};

async function fixAllIssuerIds() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all completed courses
    const completed = await CompletedCourse.find({}).populate({
      path: 'enrollmentId',
      populate: { path: 'itemId' }
    });

    console.log(`📊 Found ${completed.length} completed courses\n`);

    let updated = 0;
    for (const cc of completed) {
      if (!cc.enrollmentId || !cc.enrollmentId.itemId) {
        console.log(`⚠️  Skipping ${cc.name} - no course reference`);
        continue;
      }

      const course = await PartnerCourse.findById(cc.enrollmentId.itemId).populate('owner');
      if (!course || !course.owner) {
        console.log(`⚠️  Skipping ${cc.name} - course not found`);
        continue;
      }

      const ownerIdStr = course.owner._id.toString();
      const correctPartnerId = ownerToPartnerMap[ownerIdStr];

      if (correctPartnerId && cc.issuerId.toString() !== correctPartnerId) {
        console.log(`🔧 Updating: ${cc.name}`);
        console.log(`   Old issuer: ${cc.issuerId}`);
        console.log(`   New issuer: ${correctPartnerId}`);
        
        cc.issuerId = correctPartnerId;
        await cc.save();
        updated++;
        console.log('   ✅ Updated\n');
      }
    }

    console.log(`\n✅ Updated ${updated} completed courses`);

    // Show final results
    const all = await CompletedCourse.find({ userId: '690302badd7c9774cfd2a6a7' }).sort({ createdAt: -1 });
    console.log(`\n📊 All completed courses for test user (${all.length}):\n`);
    all.forEach((c, i) => {
      console.log(`${i+1}. ${c.name} - Score: ${c.score}/100`);
      console.log(`   Issuer ID: ${c.issuerId}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllIssuerIds();
