/**
 * Quick Dashboard API Test
 */

const axios = require('axios');

async function quickTest() {
  const BASE_URL = 'http://localhost:5000/api';
  
  try {
    // Step 1: Login
    console.log('🔐 Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123456'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login OK - Token:', token.substring(0, 20) + '...\n');
    
    // Step 2: Get Dashboard
    console.log('📊 Getting dashboard...');
    const dashRes = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard Response:');
    console.log(JSON.stringify(dashRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

quickTest();
