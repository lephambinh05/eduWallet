const mongoose = require('mongoose');
const PartnerCourse = require('./src/models/PartnerCourse');
const Partner = require('./src/models/Partner');
const User = require('./src/models/User');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkCoursePartners() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all courses
    const courses = await PartnerCourse.find({}).populate('owner');
    
    console.log(`📚 Found ${courses.length} Partner Courses:\n`);
    
    const coursesByOwner = {};
    
    for (const course of courses) {
      if (!course.owner) {
        console.log(`⚠️  Course ${course._id} has no owner`);
        continue;
      }
      
      const ownerId = course.owner._id.toString();
      if (!coursesByOwner[ownerId]) {
        coursesByOwner[ownerId] = {
          owner: course.owner,
          courses: []
        };
      }
      coursesByOwner[ownerId].courses.push(course);
    }
    
    console.log('📊 Courses grouped by owner:\n');
    
    for (const [ownerId, data] of Object.entries(coursesByOwner)) {
      console.log(`Owner ID: ${ownerId}`);
      console.log(`Email: ${data.owner.email}`);
      console.log(`Name: ${data.owner.name || data.owner.username}`);
      console.log(`Courses: ${data.courses.length}`);
      
      // Try to find corresponding Partner record
      const partnerByUser = await Partner.findOne({ ownerUserId: ownerId });
      console.log(`Partner (by ownerUserId): ${partnerByUser ? partnerByUser._id + ' - ' + partnerByUser.name : '❌ NOT FOUND'}`);
      
      console.log('');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCoursePartners();
