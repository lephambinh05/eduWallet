const mongoose = require('mongoose');
const Purchase = require('./src/models/Purchase');
const Enrollment = require('./src/models/Enrollment');
const CompletedCourse = require('./src/models/CompletedCourse');
const PartnerCourse = require('./src/models/PartnerCourse');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

const studentId = '690302badd7c9774cfd2a6a7';
const partnerId = '690312ac7814790e3335d7ec'; // Website 1 partner ID

async function completeCourse() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a partner course
    const course = await PartnerCourse.findOne({ owner: partnerId });
    
    if (!course) {
      console.log('❌ No course found for this partner');
      console.log('Creating a sample course...\n');
      
      const newCourse = new PartnerCourse({
        title: 'Test Video Course - Advanced JavaScript',
        description: 'Complete JavaScript course with videos and exercises',
        owner: partnerId,
        price: 0,
        priceEdu: 50,
        link: 'http://localhost:3002',
        category: 'Programming',
        level: 'Intermediate',
        duration: 120,
        status: 'published'
      });
      
      await newCourse.save();
      console.log(`✅ Created course: ${newCourse.title}`);
      console.log(`   Course ID: ${newCourse._id}\n`);
      
      return completeCourseWithData(newCourse);
    }
    
    return completeCourseWithData(course);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function completeCourseWithData(course) {
  console.log(`📚 Using course: ${course.title}`);
  console.log(`   Course ID: ${course._id}\n`);

  // 1. Create Purchase
  console.log('1️⃣ Creating purchase...');
  const purchase = new Purchase({
    itemId: course._id,
    buyer: studentId,
    seller: partnerId,
    price: course.price || 0,
    quantity: 1,
    total: course.price || 0,
    status: 'completed'
  });
  await purchase.save();
  console.log(`   ✅ Purchase created: ${purchase._id}\n`);

  // 2. Create Enrollment
  console.log('2️⃣ Creating enrollment...');
  const enrollment = new Enrollment({
    user: studentId,
    itemId: course._id,
    purchase: purchase._id,
    seller: partnerId,
    courseTitle: course.title,
    progressPercent: 100,
    timeSpentSeconds: 3600, // 1 hour
    status: 'completed'
  });
  await enrollment.save();
  console.log(`   ✅ Enrollment created: ${enrollment._id}\n`);

  // 3. Create CompletedCourse
  console.log('3️⃣ Creating completed course...');
  const completedCourse = new CompletedCourse({
    enrollmentId: enrollment._id,
    userId: studentId,
    name: course.title,
    description: course.description,
    issuer: 'Website 1 - Video Learning Platform',
    issuerId: partnerId,
    score: 95,
    grade: 'A',
    issueDate: new Date()
  });
  await completedCourse.save();
  console.log(`   ✅ Completed course created: ${completedCourse._id}\n`);

  console.log('=' .repeat(50));
  console.log('✅ COURSE COMPLETION SUCCESSFUL!');
  console.log('=' .repeat(50));
  console.log(`Student ID: ${studentId}`);
  console.log(`Course: ${course.title}`);
  console.log(`Score: 95/100 (Grade A)`);
  console.log(`Time Spent: 1 hour`);
  console.log(`Status: Completed`);
  console.log('=' .repeat(50));
  
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
}

completeCourse();
