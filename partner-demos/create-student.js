const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function createStudent() {
  try {
    console.log('Creating demo student account...');
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      username: 'student_demo_001',
      email: 'student001@demo.com',
      password: 'Student123!@#',
      firstName: 'Demo',
      lastName: 'Student',
      dateOfBirth: '2000-01-01',
      role: 'student'
    });
    
    if (response.data.success) {
      console.log('✅ Student created successfully!');
      console.log('Student ID:', response.data.data.user._id);
      console.log('\nTest URLs:');
      console.log(`Website 1: http://localhost:3002?student=${response.data.data.user._id}`);
      console.log(`Website 2: http://localhost:3003?student=${response.data.data.user._id}`);
      console.log(`Website 3: http://localhost:3004?student=${response.data.data.user._id}`);
    }
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('ℹ️  Student already exists. Logging in...');
      
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'student001@demo.com',
        password: 'Student123!@#'
      });
      
      if (loginResponse.data.success) {
        const userId = loginResponse.data.data.user._id;
        console.log('✅ Login successful!');
        console.log('Student ID:', userId);
        console.log('\nTest URLs:');
        console.log(`Website 1: http://localhost:3002?student=${userId}`);
        console.log(`Website 2: http://localhost:3003?student=${userId}`);
        console.log(`Website 3: http://localhost:3004?student=${userId}`);
      }
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

createStudent();
