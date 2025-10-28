const mongoose = require('mongoose');
const PartnerCourse = require('../src/models/PartnerCourse');
require('dotenv').config();

async function publishAllCourses() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    // Tìm tất cả course chưa published
    const unpublishedCourses = await PartnerCourse.find({ isPublished: false });
    
    console.log(`🔍 Found ${unpublishedCourses.length} unpublished courses`);

    if (unpublishedCourses.length === 0) {
      console.log('ℹ️  All courses are already published');
      return { success: true, updated: 0 };
    }

    // Cập nhật tất cả course thành published
    const result = await PartnerCourse.updateMany(
      { isPublished: false }, 
      { $set: { isPublished: true } }
    );

    console.log(`🎉 Successfully published ${result.modifiedCount} courses`);
    
    // Hiển thị danh sách course đã cập nhật
    console.log('\n📋 Updated courses:');
    unpublishedCourses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.title} (ID: ${course._id})`);
      console.log(`     Price: ${course.priceEdu} EDU`);
      console.log(`     Owner: ${course.owner}`);
      console.log('');
    });

    return {
      success: true,
      updated: result.modifiedCount,
      courses: unpublishedCourses.map(c => ({
        id: c._id,
        title: c.title,
        priceEdu: c.priceEdu
      }))
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
  console.log('🚀 Publishing All Partner Courses...');
  console.log('─'.repeat(50));
  
  const result = await publishAllCourses();
  
  console.log('─'.repeat(50));
  if (result.success) {
    if (result.updated > 0) {
      console.log('✅ SUCCESS! All courses are now published');
      console.log(`📊 Updated ${result.updated} courses`);
      console.log('💡 The 404 errors should now be resolved');
    } else {
      console.log('✅ All courses were already published');
    }
  } else {
    console.log('💥 FAILED!', result.error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { publishAllCourses };