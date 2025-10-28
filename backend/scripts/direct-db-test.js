const mongoose = require('mongoose');
const Enrollment = require('../src/models/Enrollment');
require('dotenv').config();

async function directDatabaseTest() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    const enrollmentId = '69011352250421cb3b437164';
    
    // Test 1: Lấy enrollment hiện tại
    console.log('📋 Test 1: Current enrollment state');
    const current = await Enrollment.findById(enrollmentId);
    console.log('Assessments count:', current?.metadata?.assessments?.length || 0);
    console.log('Total points:', current?.totalPoints);
    console.log('Progress:', current?.progressPercent + '%');
    
    if (current?.metadata?.assessments) {
      console.log('Current assessments:');
      current.metadata.assessments.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.title} - ${a.score} (${a._id})`);
      });
    }

    // Test 2: Thêm assessment trực tiếp
    console.log('\n🔧 Test 2: Adding assessment directly to database');
    
    if (!current.metadata) current.metadata = {};
    if (!Array.isArray(current.metadata.assessments)) {
      current.metadata.assessments = [];
    }

    const testAssessment = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Direct DB Test',
      score: 6.5,
      createdBy: new mongoose.Types.ObjectId('69010d91e5ba7476d42707fa'),
      createdAt: new Date()
    };

    current.metadata.assessments.push(testAssessment);
    
    // Recalculate
    const scores = current.metadata.assessments.map(a => Number(a.score) || 0);
    const totalPoints = scores.reduce((sum, score) => sum + score, 0);
    const avg = scores.length ? totalPoints / scores.length : 0;
    const progressPercent = Math.round((avg / 10) * 100);

    current.totalPoints = totalPoints;
    current.progressPercent = progressPercent;
    current.lastAccessed = new Date();

    // Mark as modified và save
    current.markModified('metadata');
    current.markModified('metadata.assessments');

    await current.save();
    console.log('✅ Assessment added and saved');

    // Test 3: Verify save worked
    console.log('\n🔍 Test 3: Verify assessment was saved');
    const verified = await Enrollment.findById(enrollmentId);
    console.log('New assessments count:', verified?.metadata?.assessments?.length || 0);
    console.log('New total points:', verified?.totalPoints);
    console.log('New progress:', verified?.progressPercent + '%');
    
    if (verified?.metadata?.assessments) {
      console.log('All assessments after save:');
      verified.metadata.assessments.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.title} - ${a.score} (${a._id})`);
      });
    }

    // Test 4: API simulation - GET enrollment
    console.log('\n📡 Test 4: Simulating API GET response');
    const apiResponse = {
      success: true,
      data: {
        enrollment: {
          _id: verified._id,
          totalPoints: verified.totalPoints,
          progressPercent: verified.progressPercent,
          metadata: {
            assessments: verified.metadata?.assessments || []
          }
        }
      }
    };

    console.log('API response structure:');
    console.log('- success:', apiResponse.success);
    console.log('- assessments count:', apiResponse.data.enrollment.metadata.assessments.length);
    console.log('- total points:', apiResponse.data.enrollment.totalPoints);

    return {
      success: true,
      beforeCount: (current?.metadata?.assessments?.length || 0) - 1,
      afterCount: verified?.metadata?.assessments?.length || 0,
      apiResponse
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
  console.log('🧪 Direct Database Assessment Test');
  console.log('═'.repeat(50));
  
  const result = await directDatabaseTest();
  
  console.log('═'.repeat(50));
  if (result.success) {
    console.log(`✅ Test completed!`);
    console.log(`📊 Assessments: ${result.beforeCount} → ${result.afterCount}`);
    if (result.afterCount > result.beforeCount) {
      console.log('🎉 Assessment successfully added to metadata!');
      console.log('💡 If frontend still shows old data, the issue is in frontend cache/state');
    } else {
      console.log('❌ Assessment was not saved to database');
      console.log('💡 There might be a mongoose schema or validation issue');
    }
  } else {
    console.log('💥 Test failed:', result.error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { directDatabaseTest };