const axios = require('axios');

const API_BASE_URL = 'http://localhost:3003/api';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login API...\n');
  
  const credentials = {
    email: 'admin@example.com',
    password: 'Admin123456'
  };
  
  console.log('📤 Sending login request...');
  console.log('   Email:', credentials.email);
  console.log('   Password:', credentials.password);
  console.log('   URL:', `${API_BASE_URL}/auth/login`);
  console.log('');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
    console.log('✅ Login Successful!\n');
    console.log('📊 Response Data:');
    console.log('   Success:', response.data.success);
    console.log('   Message:', response.data.message);
    console.log('');
    
    if (response.data.data) {
      const { user, accessToken, refreshToken } = response.data.data;
      
      console.log('👤 User Info:');
      console.log('   ID:', user._id);
      console.log('   Username:', user.username);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   isActive:', user.isActive);
      console.log('');
      
      console.log('🔑 Tokens:');
      console.log('   Access Token:', accessToken ? accessToken.substring(0, 50) + '...' : 'N/A');
      console.log('   Refresh Token:', refreshToken ? refreshToken.substring(0, 50) + '...' : 'N/A');
      console.log('');
      
      // Test if user is admin
      if (['admin', 'super_admin'].includes(user.role)) {
        console.log('✅ User has admin privileges');
        console.log('✅ Should be able to access admin dashboard');
      } else {
        console.log('❌ User does NOT have admin privileges');
        console.log('❌ Role:', user.role);
      }
      
      // Test dashboard API with token
      console.log('\n🧪 Testing Dashboard API with token...');
      try {
        const dashboardResponse = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        console.log('✅ Dashboard API works!');
        console.log('📊 Stats:', JSON.stringify(dashboardResponse.data.data.stats.overview, null, 2));
      } catch (dashError) {
        console.log('❌ Dashboard API failed:', dashError.response?.data?.message || dashError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Login Failed!\n');
    
    if (error.response) {
      console.log('📊 Error Response:');
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('❌ No response from server');
      console.log('   Make sure backend is running on port 3003');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testAdminLogin();
