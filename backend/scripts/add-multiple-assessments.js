const mongoose = require('mongoose');
const Enrollment = require('../src/models/Enrollment');
require('dotenv').config();

async function addNewAssessment() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    const enrollmentId = '69011352250421cb3b437164';
    console.log(`🔍 Looking for enrollment ID: ${enrollmentId}`);

    // Tìm enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment with ID ${enrollmentId} not found`);
    }

    console.log(`📄 Found enrollment: "${enrollment.courseTitle}"`);
    console.log(`👤 Student: ${enrollment.user}`);
    console.log(`📊 Current assessments: ${enrollment.metadata?.assessments?.length || 0}`);

    // Hiển thị assessments hiện tại
    if (enrollment.metadata?.assessments) {
      console.log('\n📋 Current assessments:');
      enrollment.metadata.assessments.forEach((assessment, index) => {
        console.log(`  ${index + 1}. ${assessment.title} - Score: ${assessment.score}`);
        console.log(`     ID: ${assessment._id}`);
        console.log(`     Created: ${assessment.createdAt}`);
        console.log('');
      });
    }

    // Thêm assessment mới
    enrollment.metadata = enrollment.metadata || {};
    const assessments = Array.isArray(enrollment.metadata.assessments)
      ? enrollment.metadata.assessments
      : [];

    // Tạo assessment mới
    const newAssessment = {
      _id: new mongoose.Types.ObjectId(),
      title: "Kiểm tra JavaScript",
      score: 8.5,
      createdBy: new mongoose.Types.ObjectId("69010d91e5ba7476d42707fa"), // Seller ID
      createdAt: new Date(),
    };

    // Thêm vào array
    assessments.push(newAssessment);

    // Tính lại điểm
    const scores = assessments.map((a) => Number(a.score) || 0);
    const totalPoints = scores.reduce((s, v) => s + v, 0);
    const avg = scores.length ? totalPoints / scores.length : 0;
    const progressPercent = Math.round((avg / 10) * 100);

    // Cập nhật enrollment
    enrollment.metadata.assessments = assessments;
    enrollment.totalPoints = totalPoints;
    enrollment.progressPercent = progressPercent;
    enrollment.lastAccessed = new Date();

    await enrollment.save();

    console.log('🎉 Assessment added successfully!');
    console.log(`📝 New Assessment:`);
    console.log(`   Title: ${newAssessment.title}`);
    console.log(`   Score: ${newAssessment.score}`);
    console.log(`   ID: ${newAssessment._id}`);
    console.log('');
    console.log(`📊 Updated stats:`);
    console.log(`   Total assessments: ${assessments.length}`);
    console.log(`   Total points: ${totalPoints}`);
    console.log(`   Progress: ${progressPercent}%`);

    // Thêm assessment thứ 3
    const newAssessment2 = {
      _id: new mongoose.Types.ObjectId(),
      title: "Bài tập React.js",
      score: 9.0,
      createdBy: new mongoose.Types.ObjectId("69010d91e5ba7476d42707fa"),
      createdAt: new Date(),
    };

    assessments.push(newAssessment2);

    // Tính lại điểm
    const scores2 = assessments.map((a) => Number(a.score) || 0);
    const totalPoints2 = scores2.reduce((s, v) => s + v, 0);
    const avg2 = scores2.length ? totalPoints2 / scores2.length : 0;
    const progressPercent2 = Math.round((avg2 / 10) * 100);

    enrollment.metadata.assessments = assessments;
    enrollment.totalPoints = totalPoints2;
    enrollment.progressPercent = progressPercent2;

    await enrollment.save();

    console.log('🎉 Second assessment added!');
    console.log(`📝 Second Assessment:`);
    console.log(`   Title: ${newAssessment2.title}`);
    console.log(`   Score: ${newAssessment2.score}`);
    console.log(`   ID: ${newAssessment2._id}`);
    console.log('');
    console.log(`📊 Final stats:`);
    console.log(`   Total assessments: ${assessments.length}`);
    console.log(`   Total points: ${totalPoints2}`);
    console.log(`   Progress: ${progressPercent2}%`);

    return {
      success: true,
      enrollmentId,
      totalAssessments: assessments.length,
      totalPoints: totalPoints2,
      progressPercent: progressPercent2,
      newAssessments: [newAssessment, newAssessment2]
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Script chính
async function main() {
  console.log('🚀 Adding Multiple Assessments to Enrollment...');
  console.log('─'.repeat(50));
  
  const result = await addNewAssessment();
  
  console.log('─'.repeat(50));
  if (result.success) {
    console.log('✅ SUCCESS! Multiple assessments added');
    console.log(`📊 Total assessments: ${result.totalAssessments}`);
    console.log(`💯 Total points: ${result.totalPoints}`);
    console.log(`📈 Progress: ${result.progressPercent}%`);
  } else {
    console.log('💥 FAILED!', result.error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addNewAssessment };