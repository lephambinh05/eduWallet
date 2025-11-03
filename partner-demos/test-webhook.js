const crypto = require('crypto');
const axios = require('axios');

// Configuration
const EDUWALLET_API_URL = 'http://localhost:5000'; // Hoặc https://api-eduwallet.mojistudio.vn
const PARTNER_ID = 'your_partner_id_here'; // Thay bằng partner ID thật
const PARTNER_SECRET = 'your_partner_secret_here'; // Thay bằng secret key thật

// Helper function to create HMAC signature
function createSignature(timestamp, body) {
  const payload = `${timestamp}${body}`;
  const hmac = crypto.createHmac('sha256', PARTNER_SECRET);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Test data - CompletedCourse format
const testPayload = {
  partnerId: PARTNER_ID,
  eventType: 'course_completed',
  studentId: 'test_student_001', // Thay bằng user ID thật trong database
  courseId: 'test_course_001',
  enrollmentId: null, // Hoặc enrollment ID thật nếu có
  completedCourse: {
    name: 'Test Course - Lập trình Web cơ bản',
    description: 'Khóa học test về lập trình web',
    issuer: 'Partner Demo',
    issueDate: new Date().toISOString(),
    expiryDate: null,
    category: 'Programming',
    level: 'Beginner',
    credits: 3,
    grade: 'A+',
    score: 95,
    status: 'Completed',
    progress: 100,
    modulesCompleted: 1,
    totalModules: 1,
    skills: ['HTML', 'CSS', 'JavaScript', 'Test'],
    verificationUrl: null,
    certificateUrl: null,
    imageUrl: null
  }
};

async function testWebhook() {
  try {
    console.log('🔄 Testing Partner Webhook...\n');
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyString = JSON.stringify(testPayload);
    const signature = createSignature(timestamp, bodyString);
    
    console.log('📤 Sending webhook request...');
    console.log('Endpoint:', `${EDUWALLET_API_URL}/api/webhooks/partner-updates`);
    console.log('Partner ID:', PARTNER_ID);
    console.log('Timestamp:', timestamp);
    console.log('Signature:', signature);
    console.log('\nPayload:', JSON.stringify(testPayload, null, 2));
    console.log('\n');
    
    const response = await axios.post(
      `${EDUWALLET_API_URL}/api/webhooks/partner-updates`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-Id': PARTNER_ID,
          'X-Partner-Timestamp': timestamp,
          'X-Partner-Signature': signature
        }
      }
    );
    
    console.log('✅ SUCCESS!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ ERROR!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run test
console.log('='.repeat(60));
console.log('Partner Webhook Test Script');
console.log('='.repeat(60));
console.log('\n⚠️  Lưu ý: Cần cập nhật PARTNER_ID và PARTNER_SECRET trước khi chạy!\n');

testWebhook();
