const axios = require('axios');
require('dotenv').config();

// Test API endpoint
async function testAddAssessmentAPI() {
  try {
    const enrollmentId = '69011352250421cb3b437164';
    const baseURL = 'http://localhost:3001'; // Backend URL
    
    console.log('🔍 Testing Add Assessment API...');
    console.log(`📍 Endpoint: POST ${baseURL}/api/enrollments/${enrollmentId}/assessments/add`);
    
    // Test data
    const testAssessment = {
      title: 'API Test Assessment',
      score: 8.5
    };
    
    console.log('📤 Sending request...');
    console.log('Data:', testAssessment);

    const response = await axios.post(
      `${baseURL}/api/enrollments/${enrollmentId}/assessments/add`,
      testAssessment,
      {
        headers: {
          'Content-Type': 'application/json',
          // You'll need to add authentication token here
          // 'Authorization': 'Bearer YOUR_TOKEN'
        }
      }
    );

    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    
    if (response.data.data) {
      const enrollment = response.data.data.enrollment;
      const newAssessment = response.data.data.newAssessment;
      
      console.log('\n📊 Updated enrollment:');
      console.log('Total Points:', enrollment.totalPoints);
      console.log('Progress:', enrollment.progressPercent + '%');
      console.log('Assessments count:', enrollment.metadata?.assessments?.length || 0);
      
      console.log('\n📝 New assessment:');
      console.log('ID:', newAssessment._id);
      console.log('Title:', newAssessment.title);
      console.log('Score:', newAssessment.score);
      console.log('Created by:', newAssessment.createdBy);
      console.log('Created at:', newAssessment.createdAt);
      
      if (enrollment.metadata?.assessments) {
        console.log('\n📋 All assessments:');
        enrollment.metadata.assessments.forEach((a, i) => {
          console.log(`  ${i+1}. ${a.title} - Score: ${a.score} (ID: ${a._id})`);
        });
      }
    }

    return { success: true, response: response.data };

  } catch (error) {
    console.error('❌ API Test Failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
      console.error('Is backend running on http://localhost:3001?');
    } else {
      console.error('Request error:', error.message);
    }
    
    return { success: false, error: error.message };
  }
}

// Test với curl command
function generateCurlCommand() {
  const enrollmentId = '69011352250421cb3b437164';
  const baseURL = 'http://localhost:3001';
  
  console.log('\n📋 Curl command to test manually:');
  console.log('─'.repeat(50));
  
  const curlCmd = `curl -X POST "${baseURL}/api/enrollments/${enrollmentId}/assessments/add" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_TOKEN_HERE" \\
-d '{
  "title": "Manual Test Assessment",
  "score": 7.5
}'`;

  console.log(curlCmd);
  console.log('─'.repeat(50));
  console.log('💡 Replace YOUR_TOKEN_HERE with actual JWT token');
}

// Script chính  
async function main() {
  console.log('🚀 API Endpoint Test');
  console.log('═'.repeat(50));
  
  generateCurlCommand();
  
  console.log('\n🔄 Attempting API call...');
  const result = await testAddAssessmentAPI();
  
  console.log('═'.repeat(50));
  if (result.success) {
    console.log('✅ API test successful!');
    console.log('💡 The endpoint is working correctly');
  } else {
    console.log('💥 API test failed!');
    console.log('💡 Check if:');
    console.log('   - Backend is running');
    console.log('   - Authentication token is valid');
    console.log('   - Endpoint URL is correct');
  }
}

if (require.main === module) {
  main();
}

module.exports = { testAddAssessmentAPI };