/**
 * Sync Demo Websites Courses to Database
 * Tạo các khóa học từ 3 website demo vào database
 */

const axios = require('axios');
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const PARTNER_EMAIL = 'partner111@gmail.com';
const PARTNER_PASSWORD = 'Trongkhang205@';

// Courses from each demo website
const DEMO_COURSES = {
  website1: {
    title: 'Học lập trình Web cơ bản',
    description: 'Khóa học lập trình web từ cơ bản đến nâng cao với video hướng dẫn chi tiết',
    link: 'http://localhost:3002/courses/course_001',
    priceEdu: 50,
    category: 'Programming',
    level: 'Beginner',
    credits: 3,
    duration: 600, // 10 minutes
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    websiteUrl: 'http://localhost:3002'
  },
  website2: {
    title: 'Lập trình JavaScript nâng cao',
    description: 'Khóa học JavaScript nâng cao với bài tập quiz tương tác',
    link: 'http://localhost:3003/courses/quiz_course_001',
    priceEdu: 75,
    category: 'Programming',
    level: 'Intermediate',
    credits: 4,
    duration: 900, // 15 minutes
    skills: ['JavaScript', 'ES6+', 'Async/Await', 'Promises'],
    websiteUrl: 'http://localhost:3003'
  },
  website3: {
    title: 'Full-stack Development với React & Node.js',
    description: 'Khóa học toàn diện kết hợp video và quiz thực hành',
    link: 'http://localhost:3004/courses/fullstack_001',
    priceEdu: 150,
    category: 'Programming',
    level: 'Advanced',
    credits: 6,
    duration: 1800, // 30 minutes
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
    websiteUrl: 'http://localhost:3004'
  }
};

async function syncCourses() {
  try {
    console.log('\n🚀 SYNCING DEMO WEBSITE COURSES TO DATABASE\n');
    console.log('='.repeat(60));

    // 1. Login as partner
    console.log('\n📋 Step 1: Authenticating as partner...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: PARTNER_EMAIL,
      password: PARTNER_PASSWORD,
    });

    const token = loginResponse.data.data.accessToken;
    const partnerId = loginResponse.data.data.user._id;
    console.log(`✅ Logged in as: ${PARTNER_EMAIL}`);
    console.log(`   Partner ID: ${partnerId}`);

    // 2. Get existing courses
    console.log('\n📋 Step 2: Checking existing courses...');
    const existingCoursesResponse = await axios.get(
      `${BACKEND_URL}/api/partner/courses`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const existingCourses = existingCoursesResponse.data.data.courses;
    console.log(`   Found ${existingCourses.length} existing courses`);

    // 3. Create new courses
    console.log('\n📋 Step 3: Creating courses from demo websites...\n');

    const createdCourses = [];

    for (const [websiteKey, courseData] of Object.entries(DEMO_COURSES)) {
      // Check if course already exists
      const exists = existingCourses.find(c => c.title === courseData.title);
      
      if (exists) {
        console.log(`⏭️  SKIPPED: "${courseData.title}" (already exists)`);
        console.log(`   ID: ${exists._id}`);
        createdCourses.push(exists);
      } else {
        // Create new course
        const createResponse = await axios.post(
          `${BACKEND_URL}/api/partner/courses`,
          {
            title: courseData.title,
            description: courseData.description,
            link: courseData.link,
            priceEdu: courseData.priceEdu,
            isPublished: true,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newCourse = createResponse.data.data.course;
        console.log(`✅ CREATED: "${courseData.title}"`);
        console.log(`   ID: ${newCourse._id}`);
        console.log(`   Price: ${courseData.priceEdu} EDU`);
        console.log(`   Link: ${courseData.link}`);
        createdCourses.push(newCourse);
      }
      console.log('');
    }

    // 4. Summary
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:\n');
    console.log(`Total demo websites: ${Object.keys(DEMO_COURSES).length}`);
    console.log(`Courses in database: ${createdCourses.length}`);
    console.log('');

    console.log('📚 COURSES LIST:\n');
    createdCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Price: ${course.priceEdu} EDU tokens`);
      console.log(`   Published: ${course.isPublished ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('✅ SYNC COMPLETED!\n');

    // 5. Update .env files for each website with course IDs
    console.log('📋 Step 4: Updating .env files...\n');
    
    const websiteKeys = Object.keys(DEMO_COURSES);
    for (let i = 0; i < createdCourses.length; i++) {
      const websiteKey = websiteKeys[i];
      const course = createdCourses[i];
      const websiteData = DEMO_COURSES[websiteKey];
      
      console.log(`✅ Website ${i + 1}: ${websiteData.websiteUrl}`);
      console.log(`   Course ID to use: ${course._id}`);
      console.log(`   Add to .env: COURSE_ID=${course._id}`);
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run sync
syncCourses();
