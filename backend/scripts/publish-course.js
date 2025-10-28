const mongoose = require('mongoose');
const PartnerCourse = require('../src/models/PartnerCourse');
require('dotenv').config();

async function publishCourse(courseId) {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB');

    console.log(`🔍 Looking for course ID: ${courseId}`);

    // Tìm và cập nhật course
    const course = await PartnerCourse.findById(courseId);
    
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    console.log(`📄 Found course: "${course.title}"`);
    console.log(`📅 Current published status: ${course.isPublished ? '✅ Published' : '❌ Not Published'}`);

    if (course.isPublished) {
      console.log('ℹ️  Course is already published');
      return {
        success: true,
        message: 'Course was already published',
        course: {
          id: course._id,
          title: course.title,
          isPublished: course.isPublished
        }
      };
    }

    // Cập nhật isPublished = true
    course.isPublished = true;
    await course.save();

    console.log('🎉 Course published successfully!');
    console.log(`📄 Title: ${course.title}`);
    console.log(`💰 Price: ${course.priceEdu} EDU`);
    console.log(`📅 Now published: ✅ YES`);

    return {
      success: true,
      message: 'Course published successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        link: course.link,
        priceEdu: course.priceEdu,
        isPublished: course.isPublished,
        owner: course.owner,
        updatedAt: new Date()
      }
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Script chính
async function main() {
  const courseId = '69010e33e5ba7476d4270828'; // Course ID từ lỗi 404
  
  console.log('🚀 Publishing Partner Course...');
  console.log(`🎯 Target Course ID: ${courseId}`);
  console.log('─'.repeat(50));
  
  const result = await publishCourse(courseId);
  
  console.log('─'.repeat(50));
  if (result.success) {
    console.log('✅ SUCCESS! Course has been published');
    console.log('💡 You can now try purchasing the course again');
    console.log('🔄 The 404 error should be resolved');
  } else {
    console.log('💥 FAILED!', result.error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { publishCourse };