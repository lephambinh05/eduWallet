/**
 * Partner API Testing Script
 * Tests all 21 Partner API endpoints
 * 
 * Usage:
 *   node scripts/test-partner-api.js
 * 
 * Environment Variables Required:
 *   - BACKEND_URL (default: http://localhost:5000)
 *   - PARTNER_EMAIL (partner account email)
 *   - PARTNER_PASSWORD (partner account password)
 *   - STUDENT_EMAIL (student account email)
 *   - STUDENT_PASSWORD (student account password)
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const PARTNER_EMAIL = process.env.PARTNER_EMAIL || 'partner@test.com';
const PARTNER_PASSWORD = process.env.PARTNER_PASSWORD || 'password123';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'student@test.com';
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD || 'password123';

// Test state
let partnerToken = null;
let studentToken = null;
let apiKey = null;
let courseId = null;
let purchaseId = null;
let enrollmentId = null;
let completedCourseId = null;

// Test statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper functions
const log = {
  section: (msg) => console.log('\n' + '='.repeat(60).cyan),
  title: (msg) => console.log(`\n📋 ${msg}`.bold.cyan),
  test: (msg) => console.log(`\n🧪 Testing: ${msg}`.yellow),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  info: (msg) => console.log(`ℹ️  ${msg}`.blue),
  data: (data) => console.log(JSON.stringify(data, null, 2).gray),
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testEndpoint(name, fn) {
  totalTests++;
  log.test(name);
  try {
    await fn();
    passedTests++;
    log.success(`PASSED: ${name}`);
  } catch (error) {
    failedTests++;
    log.error(`FAILED: ${name}`);
    log.error(`Error: ${error.message}`);
    if (error.response?.data) {
      log.data(error.response.data);
    }
  }
  await delay(500); // Delay between tests
}

// ============================================================================
// AUTHENTICATION SETUP
// ============================================================================

async function setupAuthentication() {
  log.section();
  log.title('SETUP: Authentication');

  try {
    // Login as partner
    log.info('Logging in as partner...');
    const partnerLogin = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: PARTNER_EMAIL,
      password: PARTNER_PASSWORD,
    });
    partnerToken = partnerLogin.data.data.accessToken;
    partnerId = partnerLogin.data.data.user._id;
    log.success('Partner login successful');

    // Login as student
    log.info('Logging in as student...');
    const studentLogin = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD,
    });
    studentToken = studentLogin.data.data.accessToken;
    studentId = studentLogin.data.data.user._id;
    log.success('Student login successful');

    return true;
  } catch (error) {
    log.error('Authentication setup failed');
    log.error(error.message);
    if (error.response?.data) {
      log.data(error.response.data);
    }
    return false;
  }
}

// ============================================================================
// API KEY MANAGEMENT TESTS (4 endpoints)
// ============================================================================

async function testApiKeyManagement() {
  log.section();
  log.title('API KEY MANAGEMENT (4 endpoints)');

  // 1. Generate API Key (or get existing)
  await testEndpoint('POST /api/partner/apikey/generate', async () => {
    try {
      // Try to generate new API key (will fail if exists without password)
      const response = await axios.post(
        `${BACKEND_URL}/api/partner/apikey/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${partnerToken}` },
        }
      );
      
      if (!response.data.success || !response.data.data.apiKey) {
        throw new Error('Failed to generate API key');
      }
      
      apiKey = response.data.data.apiKey;
      log.info(`API Key generated: ${apiKey.slice(0, 10)}...`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        // API key already exists, get it by revealing
        log.info('API key already exists, will retrieve it via reveal...');
        const revealResponse = await axios.post(
          `${BACKEND_URL}/api/partner/apikey/reveal`,
          { password: PARTNER_PASSWORD },
          {
            headers: { Authorization: `Bearer ${partnerToken}` },
          }
        );
        
        if (revealResponse.data.success && revealResponse.data.data.apiKey) {
          apiKey = revealResponse.data.data.apiKey;
          log.info(`API Key retrieved: ${apiKey.slice(0, 10)}...`);
        } else {
          throw new Error('Failed to retrieve existing API key');
        }
      } else {
        throw error;
      }
    }
  });

  // 2. Get API Key Metadata
  await testEndpoint('GET /api/partner/apikey', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/apikey`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.exists) {
      throw new Error('Failed to get API key metadata');
    }
    
    log.info(`Masked key: ${response.data.data.maskedKey}`);
  });

  // 3. Reveal API Key
  await testEndpoint('POST /api/partner/apikey/reveal', async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/partner/apikey/reveal`,
      {},
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.apiKey) {
      throw new Error('Failed to reveal API key');
    }
    
    log.info('API key revealed successfully');
  });

  // 4. Validate API Key
  await testEndpoint('GET /api/partner/apikey/validate', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/apikey/validate`,
      {
        headers: { 'X-API-Key': apiKey },
      }
    );
    
    if (!response.data.success || !response.data.data.partner) {
      throw new Error('Failed to validate API key');
    }
    
    log.info(`Partner: ${response.data.data.partner.name}`);
  });
}

// ============================================================================
// COURSE MANAGEMENT TESTS (6 endpoints)
// ============================================================================

async function testCourseManagement() {
  log.section();
  log.title('COURSE MANAGEMENT (6 endpoints)');

  // 1. Create Course
  await testEndpoint('POST /api/partner/courses', async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/partner/courses`,
      {
        title: 'Test Course - JavaScript Advanced',
        description: 'A comprehensive JavaScript course for testing',
        link: 'https://example.com/courses/js-advanced',
        priceEdu: 100,
      },
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.course) {
      throw new Error('Failed to create course');
    }
    
    courseId = response.data.data.course._id;
    log.info(`Course created: ${courseId}`);
  });

  // 2. Get Partner's Courses
  await testEndpoint('GET /api/partner/courses', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/courses`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.courses)) {
      throw new Error('Failed to get courses');
    }
    
    log.info(`Total courses: ${response.data.data.courses.length}`);
  });

  // 3. Update Course
  await testEndpoint('PUT /api/partner/courses/:id', async () => {
    const response = await axios.put(
      `${BACKEND_URL}/api/partner/courses/${courseId}`,
      {
        title: 'Test Course - JavaScript & TypeScript',
        description: 'Updated description',
        priceEdu: 120,
      },
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || response.data.data.course.priceEdu !== 120) {
      throw new Error('Failed to update course');
    }
    
    log.info('Course updated successfully');
  });

  // 4. Publish Course
  await testEndpoint('PATCH /api/partner/courses/:id/publish', async () => {
    const response = await axios.patch(
      `${BACKEND_URL}/api/partner/courses/${courseId}/publish`,
      { publish: true },
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.course.isPublished) {
      throw new Error('Failed to publish course');
    }
    
    log.info('Course published successfully');
  });

  // 5. Get Course by ID (Public)
  await testEndpoint('GET /api/partner/public/course/:id', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/public/course/${courseId}`,
      {
        headers: { 'X-API-Key': apiKey },
      }
    );
    
    if (!response.data.success || !response.data.data.course) {
      throw new Error('Failed to get public course');
    }
    
    log.info(`Course: ${response.data.data.course.title}`);
  });

  // 6. Public Course Listing
  await testEndpoint('GET /api/partner/public-courses', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/public-courses?page=1&limit=24`
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.courses)) {
      throw new Error('Failed to get public courses');
    }
    
    log.info(`Total courses: ${response.data.data.total}`);
  });
}

// ============================================================================
// ENROLLMENT & PURCHASE TESTS (6 endpoints)
// ============================================================================

async function testEnrollmentAndPurchase() {
  log.section();
  log.title('ENROLLMENT & PURCHASE (6 endpoints)');

  // 1. Purchase Course
  await testEndpoint('POST /api/partner/courses/:id/purchase', async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/partner/courses/${courseId}/purchase`,
      {
        metadata: { source: 'test_script' },
      },
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.purchase) {
      throw new Error('Failed to purchase course');
    }
    
    purchaseId = response.data.data.purchase._id;
    enrollmentId = response.data.data.enrollment._id;
    log.info(`Purchase ID: ${purchaseId}`);
    log.info(`Enrollment ID: ${enrollmentId}`);
  });

  // 2. Get User's Enrollments
  await testEndpoint('GET /api/partner/my-enrollments', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/my-enrollments`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.enrollments)) {
      throw new Error('Failed to get enrollments');
    }
    
    log.info(`Total enrollments: ${response.data.data.total}`);
  });

  // 3. Get Enrollment Details
  await testEndpoint('GET /api/partner/enrollment/:enrollmentId', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/enrollment/${enrollmentId}`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.enrollment) {
      throw new Error('Failed to get enrollment details');
    }
    
    log.info(`Status: ${response.data.data.enrollment.status}`);
  });

  // 4. Update Enrollment Progress
  await testEndpoint('PATCH /api/partner/enrollment/:enrollmentId/progress', async () => {
    const response = await axios.patch(
      `${BACKEND_URL}/api/partner/enrollment/${enrollmentId}/progress`,
      {
        progressPercent: 50,
        totalPoints: 750,
        timeSpentSeconds: 3600,
        status: 'in_progress',
      },
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || response.data.data.enrollment.progressPercent !== 50) {
      throw new Error('Failed to update progress');
    }
    
    log.info('Progress updated to 50%');
  });

  // 5. Get Student Enrollment (Public API)
  await testEndpoint('GET /api/partner/public/enrollment/student/:studentId', async () => {
    // Get student ID from enrollment
    const enrollmentDetails = await axios.get(
      `${BACKEND_URL}/api/partner/enrollment/${enrollmentId}`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    const studentId = enrollmentDetails.data.data.enrollment.user._id;
    
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/public/enrollment/student/${studentId}?courseId=${courseId}`,
      {
        headers: { 'X-API-Key': apiKey },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.enrollments)) {
      throw new Error('Failed to get student enrollment');
    }
    
    log.info(`Enrollments found: ${response.data.data.enrollments.length}`);
  });

  // 6. Get Course Students
  await testEndpoint('GET /api/partner/courses/:courseId/students', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/courses/${courseId}/students`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.students)) {
      throw new Error('Failed to get course students');
    }
    
    log.info(`Total students: ${response.data.data.total}`);
  });
}

// ============================================================================
// SALES & ANALYTICS TESTS (2 endpoints)
// ============================================================================

async function testSalesAndAnalytics() {
  log.section();
  log.title('SALES & ANALYTICS (2 endpoints)');

  // 1. Get Partner's Sales
  await testEndpoint('GET /api/partner/sales', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/sales?page=1&limit=100`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.sales)) {
      throw new Error('Failed to get sales');
    }
    
    log.info(`Total sales: ${response.data.data.total}`);
  });

  // 2. Get Partner's Learners
  await testEndpoint('GET /api/partner/learners', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/learners?page=1&limit=50`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.learners)) {
      throw new Error('Failed to get learners');
    }
    
    log.info(`Total learners: ${response.data.data.total}`);
  });
}

// ============================================================================
// COMPLETED COURSES TESTS (4 endpoints)
// ============================================================================

async function testCompletedCourses() {
  log.section();
  log.title('COMPLETED COURSES (4 endpoints)');

  // 1. Mark Enrollment as Completed
  await testEndpoint('POST /api/partner/enrollment/:enrollmentId/complete', async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/partner/enrollment/${enrollmentId}/complete`,
      {
        category: 'Programming',
        level: 'Advanced',
        credits: 3,
        grade: 'A',
        score: 95, // Changed from 1500 to 95 (max is 100)
        skills: ['JavaScript', 'TypeScript', 'Testing'],
        certificateUrl: 'https://example.com/certificates/test123',
        verificationUrl: 'https://example.com/verify/test123',
        modulesCompleted: 10,
        totalModules: 10,
      },
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !response.data.data.completedCourse) {
      throw new Error('Failed to mark enrollment as completed');
    }
    
    completedCourseId = response.data.data.completedCourse._id;
    log.info(`Completed Course ID: ${completedCourseId}`);
  });

  // 2. Get User's Completed Courses
  await testEndpoint('GET /api/partner/completed-courses/:userId', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/completed-courses/${studentId}`,
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.courses)) {
      throw new Error('Failed to get completed courses');
    }
    
    log.info(`Total completed courses: ${response.data.data.total}`);
  });

  // 3. Get User's Completed Courses (Public API)
  await testEndpoint('GET /api/partner/public/completed-courses/user/:userId', async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/partner/public/completed-courses/user/${studentId}`,
      {
        headers: { 'X-API-Key': apiKey },
      }
    );
    
    if (!response.data.success || !Array.isArray(response.data.data.courses)) {
      throw new Error('Failed to get public completed courses');
    }
    
    log.info(`Total completed courses: ${response.data.data.total}`);
  });

  // 4. Update Completed Course
  await testEndpoint('PATCH /api/partner/completed-course/:courseId', async () => {
    if (!completedCourseId) {
      throw new Error('No completed course to update (completedCourseId is null)');
    }
    
    const response = await axios.patch(
      `${BACKEND_URL}/api/partner/completed-course/${completedCourseId}`,
      {
        grade: 'A+',
        score: 98, // Changed from 1600 to 98 (max is 100)
        skills: ['JavaScript', 'TypeScript', 'Testing', 'Node.js'],
      },
      {
        headers: { Authorization: `Bearer ${partnerToken}` },
      }
    );
    
    if (!response.data.success || response.data.data.course.grade !== 'A+') {
      throw new Error('Failed to update completed course');
    }
    
    log.info('Completed course updated successfully');
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('\n' + '═'.repeat(60).rainbow);
  console.log('🚀 PARTNER API COMPREHENSIVE TEST SUITE'.bold.rainbow);
  console.log('═'.repeat(60).rainbow);
  
  log.info(`Backend URL: ${BACKEND_URL}`);
  log.info(`Partner Email: ${PARTNER_EMAIL}`);
  log.info(`Student Email: ${STUDENT_EMAIL}`);

  // Setup
  const authSuccess = await setupAuthentication();
  if (!authSuccess) {
    log.error('Authentication setup failed. Aborting tests.');
    process.exit(1);
  }

  // Run all test suites
  await testApiKeyManagement();
  await testCourseManagement();
  await testEnrollmentAndPurchase();
  await testSalesAndAnalytics();
  await testCompletedCourses();

  // Print summary
  log.section();
  console.log('\n' + '═'.repeat(60).rainbow);
  console.log('📊 TEST SUMMARY'.bold.rainbow);
  console.log('═'.repeat(60).rainbow);
  
  console.log(`\n✅ Passed: ${passedTests}/${totalTests}`.green.bold);
  console.log(`❌ Failed: ${failedTests}/${totalTests}`.red.bold);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`.cyan.bold);
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉'.green.bold);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED'.yellow.bold);
  }
  
  console.log('\n' + '═'.repeat(60).rainbow + '\n');
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log.error('Unexpected error in test suite:');
  log.error(error.message);
  console.error(error);
  process.exit(1);
});
