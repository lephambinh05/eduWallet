/**
 * Simple test to check Dashboard API endpoint
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDashboard() {
  console.log('═══════════════════════════════════════');
  console.log('   Testing Dashboard API');
  console.log('═══════════════════════════════════════\n');

  // Step 1: Login
  console.log('Step 1: Login...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123456'
    });

    console.log('✅ Login successful');
    console.log('Response structure:', Object.keys(loginResponse.data));
    console.log('Data structure:', Object.keys(loginResponse.data.data || {}));
    
    const token = loginResponse.data.data?.token || loginResponse.data.data?.accessToken;
    
    if (!token) {
      console.log('❌ No token found in response');
      console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }

    console.log('Token preview:', token.substring(0, 30) + '...');
    console.log('Token length:', token.length);

    // Step 2: Get Dashboard Stats
    console.log('\nStep 2: Get Dashboard Stats...');
    const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Dashboard data retrieved');
    console.log('Stats:', JSON.stringify(dashboardResponse.data.data.stats.overview, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testDashboard();
