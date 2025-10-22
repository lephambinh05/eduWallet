// Test API với token mới nhất
const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWUyMDRiN2JkZjAyNTJkYWQzNDk2MiIsImlhdCI6MTc2MTEwNTM4MiwiZXhwIjoxNzYxMTkxNzgyfQ.FGPoqUcQ1V0VPx7qKY0-0Gz2punPmRZzhqs80kNBaL0';

async function testAPI() {
  try {
    console.log('🧪 Testing GET /api/admin/certificates...\n');
    
    const response = await axios.get('http://localhost:5000/api/admin/certificates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Full Response:\n', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const certs = response.data.data?.certificates || [];
      console.log(`\n📜 Found ${certs.length} certificates`);
      
      if (certs.length > 0) {
        console.log('\n📋 Certificate Details:');
        certs.forEach((cert, i) => {
          console.log(`\n${i + 1}. Certificate ID: ${cert.certificateId}`);
          console.log('   Raw student object:', JSON.stringify(cert.student, null, 2));
          console.log('   Raw issuer object:', JSON.stringify(cert.issuer, null, 2));
          console.log(`   Course: ${cert.courseName}`);
          console.log(`   Status: ${cert.status}`);
          console.log(`   IsVerified: ${cert.isVerified}`);
        });
      }
    } else {
      console.log('❌ API returned success: false');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
