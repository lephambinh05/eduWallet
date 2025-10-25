// Quick test script to verify backend Certificate API
const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWUyMDRiN2JkZjAyNTJkYWQzNDk2MiIsImlhdCI6MTc2MTEwNTM4MiwiZXhwIjoxNzYxMTkxNzgyfQ.FGPoqUcQ1V0VPx7qKY0-0Gz2punPmRZzhqs80kNBaL0';

async function testCertificates() {
  try {
    console.log('🧪 Testing GET /api/admin/certificates...');
    const response = await axios.get('http://localhost:5000/api/admin/certificates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Success! Status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.certificates) {
      console.log(`\n📜 Found ${response.data.data.certificates.length} certificates`);
      response.data.data.certificates.forEach((cert, i) => {
        console.log(`\n${i+1}. ${cert.course?.courseName || 'N/A'}`);
        console.log(`   Student: ${cert.student?.firstName} ${cert.student?.lastName}`);
        console.log(`   Institution: ${cert.institution?.name || 'N/A'}`);
        console.log(`   Status: ${cert.status}`);
        console.log(`   Verified: ${cert.isVerified ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

async function testLearnPasses() {
  try {
    console.log('\n🧪 Testing GET /api/admin/learnpasses...');
    const response = await axios.get('http://localhost:5000/api/admin/learnpasses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Success! Status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.learnPasses) {
      console.log(`\n🎓 Found ${response.data.data.learnPasses.length} learnpasses`);
      response.data.data.learnPasses.forEach((lp, i) => {
        console.log(`\n${i+1}. ${lp.studentId || 'N/A'}`);
        console.log(`   Student: ${lp.student?.firstName} ${lp.student?.lastName}`);
        console.log(`   Institution: ${lp.institution?.name || 'N/A'}`);
        console.log(`   Status: ${lp.status}`);
        console.log(`   Verified: ${lp.isVerified ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Run tests
(async () => {
  await testCertificates();
  await testLearnPasses();
})();
