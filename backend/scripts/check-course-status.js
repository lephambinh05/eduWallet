const mongoose = require('mongoose');
const PartnerCourse = require('../src/models/PartnerCourse');
require('dotenv').config();

async function checkCourseStatus() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    const courseId = '69010e33e5ba7476d4270828';
    console.log(`🔍 Checking course ID: ${courseId}`);

    // Kiểm tra course có tồn tại không
    const course = await PartnerCourse.findById(courseId);
    
    if (!course) {
      console.log('❌ Course not found in database');
      
      // Liệt kê tất cả courses available
      const allCourses = await PartnerCourse.find({}).limit(5);
      console.log(`📋 Available courses (${allCourses.length} found):`);
      allCourses.forEach(c => {
        console.log(`  - ID: ${c._id}`);
        console.log(`    Title: ${c.title}`);
        console.log(`    Published: ${c.isPublished}`);
        console.log(`    Price: ${c.priceEdu} EDU`);
        console.log('');
      });
      
      return {
        found: false,
        courseId,
        availableCourses: allCourses
      };
    }

    console.log('✅ Course found!');
    console.log(`📄 Title: ${course.title}`);
    console.log(`📝 Description: ${course.description}`);
    console.log(`🔗 Link: ${course.link}`);
    console.log(`💰 Price: ${course.priceEdu} EDU`);
    console.log(`📅 Published: ${course.isPublished ? '✅ YES' : '❌ NO'}`);
    console.log(`👤 Owner: ${course.owner}`);
    console.log(`📅 Created: ${course.createdAt}`);

    return {
      found: true,
      courseId,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        link: course.link,
        priceEdu: course.priceEdu,
        isPublished: course.isPublished,
        owner: course.owner,
        createdAt: course.createdAt
      }
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Script chính
async function main() {
  console.log('🔍 Checking Partner Course Status...');
  console.log('─'.repeat(50));
  
  const result = await checkCourseStatus();
  
  console.log('─'.repeat(50));
  if (result.error) {
    console.log('💥 FAILED!', result.error);
  } else if (!result.found) {
    console.log('❌ Course not found - this explains the 404 error');
    console.log('💡 Suggestion: Use one of the available course IDs listed above');
  } else if (!result.course.isPublished) {
    console.log('⚠️  Course found but NOT PUBLISHED - this explains the 404 error');
    console.log('💡 Suggestion: Run the fix script to publish this course');
  } else {
    console.log('✅ Course found and published - 404 error might be from other causes');
    console.log('💡 Check: Authentication token, API endpoint spelling, server logs');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkCourseStatus };