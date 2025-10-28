const mongoose = require('mongoose');
const Enrollment = require('../src/models/Enrollment');
require('dotenv').config();

async function verifyDatabaseState() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    const enrollmentId = '69011352250421cb3b437164';
    
    // Query với mongoose
    console.log('🔍 Querying with Mongoose...');
    const enrollmentMongoose = await Enrollment.findById(enrollmentId);
    
    if (enrollmentMongoose) {
      console.log(`📊 Mongoose result:`);
      console.log(`   Assessments: ${enrollmentMongoose.metadata?.assessments?.length || 0}`);
      console.log(`   Total points: ${enrollmentMongoose.totalPoints}`);
      console.log(`   Progress: ${enrollmentMongoose.progressPercent}%`);
      console.log(`   Updated: ${enrollmentMongoose.updatedAt}`);
      console.log(`   __v: ${enrollmentMongoose.__v}`);
      
      if (enrollmentMongoose.metadata?.assessments) {
        enrollmentMongoose.metadata.assessments.forEach((a, i) => {
          console.log(`   ${i+1}. "${a.title}" - Score: ${a.score}`);
          console.log(`      ID: ${a._id}, Created: ${a.createdAt}`);
        });
      }
    }

    // Query trực tiếp với MongoDB native
    console.log('\n🔍 Querying with MongoDB Native...');
    const db = mongoose.connection.db;
    const collection = db.collection('enrollments');
    const enrollmentNative = await collection.findOne({ 
      _id: new mongoose.Types.ObjectId(enrollmentId) 
    });
    
    if (enrollmentNative) {
      console.log(`📊 Native MongoDB result:`);
      console.log(`   Assessments: ${enrollmentNative.metadata?.assessments?.length || 0}`);
      console.log(`   Total points: ${enrollmentNative.totalPoints}`);
      console.log(`   Progress: ${enrollmentNative.progressPercent}%`);
      console.log(`   Updated: ${enrollmentNative.updatedAt}`);
      console.log(`   __v: ${enrollmentNative.__v}`);
      
      if (enrollmentNative.metadata?.assessments) {
        enrollmentNative.metadata.assessments.forEach((a, i) => {
          console.log(`   ${i+1}. "${a.title}" - Score: ${a.score}`);
          console.log(`      ID: ${a._id}, Created: ${a.createdAt}`);
        });
      }
    }

    // So sánh kết quả
    const mongooseCount = enrollmentMongoose?.metadata?.assessments?.length || 0;
    const nativeCount = enrollmentNative?.metadata?.assessments?.length || 0;
    
    console.log('\n🔬 Comparison:');
    console.log(`   Mongoose: ${mongooseCount} assessments`);
    console.log(`   Native:   ${nativeCount} assessments`);
    
    if (mongooseCount === nativeCount && mongooseCount > 1) {
      console.log('✅ SUCCESS: Multiple assessments are properly stored!');
    } else if (mongooseCount !== nativeCount) {
      console.log('⚠️  WARNING: Mongoose and Native results differ');
    } else {
      console.log('❌ Issue: Still only 1 assessment in database');
    }

    return {
      success: true,
      mongooseCount,
      nativeCount,
      enrollment: enrollmentNative
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
  console.log('🔍 Verifying Database State...');
  console.log('─'.repeat(50));
  
  const result = await verifyDatabaseState();
  
  console.log('─'.repeat(50));
  if (result.success) {
    console.log(`📊 Final assessment count: ${result.mongooseCount}`);
    
    if (result.mongooseCount > 1) {
      console.log('🎉 Multiple assessments confirmed!');
      console.log('💡 If you still see only 1 assessment in your DB tool,');
      console.log('   try refreshing or checking the connection.');
    }
  } else {
    console.log('💥 FAILED!', result.error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyDatabaseState };