const mongoose = require('mongoose');
const Enrollment = require('../src/models/Enrollment');
require('dotenv').config();

async function debugEnrollment() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    const enrollmentId = '69011352250421cb3b437164';
    console.log(`🔍 Checking enrollment ID: ${enrollmentId}`);

    // Tìm enrollment trước khi sửa
    const enrollmentBefore = await Enrollment.findById(enrollmentId);
    if (!enrollmentBefore) {
      throw new Error(`Enrollment not found`);
    }

    console.log('📊 BEFORE modification:');
    console.log(`   Assessments count: ${enrollmentBefore.metadata?.assessments?.length || 0}`);
    console.log(`   Total points: ${enrollmentBefore.totalPoints}`);
    console.log(`   Progress: ${enrollmentBefore.progressPercent}%`);
    console.log(`   __v: ${enrollmentBefore.__v}`);
    
    if (enrollmentBefore.metadata?.assessments) {
      enrollmentBefore.metadata.assessments.forEach((a, i) => {
        console.log(`   ${i+1}. ${a.title} - ${a.score} (ID: ${a._id})`);
      });
    }

    // Thêm assessment trực tiếp vào array
    console.log('\n🔧 Adding new assessment...');
    
    if (!enrollmentBefore.metadata) {
      enrollmentBefore.metadata = {};
    }
    if (!Array.isArray(enrollmentBefore.metadata.assessments)) {
      enrollmentBefore.metadata.assessments = [];
    }

    const newAssessment = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Assessment Direct",
      score: 7.5,
      createdBy: new mongoose.Types.ObjectId("69010d91e5ba7476d42707fa"),
      createdAt: new Date(),
    };

    // Thêm vào array và log để debug
    console.log(`   Adding: ${newAssessment.title} (${newAssessment.score})`);
    enrollmentBefore.metadata.assessments.push(newAssessment);
    
    console.log(`   Array length after push: ${enrollmentBefore.metadata.assessments.length}`);

    // Tính lại stats
    const scores = enrollmentBefore.metadata.assessments.map((a) => Number(a.score) || 0);
    const totalPoints = scores.reduce((s, v) => s + v, 0);
    const avg = scores.length ? totalPoints / scores.length : 0;
    const progressPercent = Math.round((avg / 10) * 100);

    enrollmentBefore.totalPoints = totalPoints;
    enrollmentBefore.progressPercent = progressPercent;
    enrollmentBefore.lastAccessed = new Date();

    console.log(`   New total points: ${totalPoints}`);
    console.log(`   New progress: ${progressPercent}%`);

    // Đánh dấu modified để mongoose biết cần save
    enrollmentBefore.markModified('metadata');
    enrollmentBefore.markModified('metadata.assessments');

    // Save với validation
    const saveResult = await enrollmentBefore.save();
    console.log(`✅ Save successful. New __v: ${saveResult.__v}`);

    // Fetch lại từ database để verify
    const enrollmentAfter = await Enrollment.findById(enrollmentId);
    
    console.log('\n📊 AFTER modification (verified from DB):');
    console.log(`   Assessments count: ${enrollmentAfter.metadata?.assessments?.length || 0}`);
    console.log(`   Total points: ${enrollmentAfter.totalPoints}`);
    console.log(`   Progress: ${enrollmentAfter.progressPercent}%`);
    console.log(`   __v: ${enrollmentAfter.__v}`);
    
    if (enrollmentAfter.metadata?.assessments) {
      enrollmentAfter.metadata.assessments.forEach((a, i) => {
        console.log(`   ${i+1}. ${a.title} - ${a.score} (ID: ${a._id})`);
      });
    }

    return {
      success: true,
      before: enrollmentBefore.metadata?.assessments?.length || 0,
      after: enrollmentAfter.metadata?.assessments?.length || 0
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Script chính
async function main() {
  console.log('🔍 Debug Enrollment Assessment Addition...');
  console.log('─'.repeat(60));
  
  const result = await debugEnrollment();
  
  console.log('─'.repeat(60));
  if (result.success) {
    console.log(`✅ Assessment count: ${result.before} → ${result.after}`);
    if (result.after > result.before) {
      console.log('🎉 SUCCESS! Assessment added and persisted');
    } else {
      console.log('⚠️  WARNING: Assessment not persisted to database');
    }
  } else {
    console.log('💥 FAILED!', result.error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { debugEnrollment };