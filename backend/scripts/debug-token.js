const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const PARTNER_EMAIL = 'partner111@gmail.com';
const PARTNER_PASSWORD = 'Trongkhang205@';

async function debugToken() {
  try {
    console.log('🔍 Testing login endpoint...\n');
    
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: PARTNER_EMAIL,
      password: PARTNER_PASSWORD,
    });

    console.log('📦 Full Login Response:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    console.log('\n');

    console.log('🔑 Extracted Token:');
    console.log('loginResponse.data.token =', loginResponse.data.token);
    console.log('loginResponse.data.data.token =', loginResponse.data.data?.token);
    console.log('\n');

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    if (!token) {
      console.error('❌ NO TOKEN FOUND!');
      return;
    }

    console.log('✅ Token to use:', token.substring(0, 50) + '...\n');

    // Test with token
    console.log('🧪 Testing API call with token...\n');
    const testResponse = await axios.get(`${BACKEND_URL}/api/partner/apikey`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ API call successful!');
    console.log(JSON.stringify(testResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugToken();
