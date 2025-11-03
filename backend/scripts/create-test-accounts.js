/**
 * Create Test Accounts Script
 * Creates partner and student accounts for testing Partner API
 * 
 * Usage: node scripts/create-test-accounts.js
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

const accounts = [
  {
    type: 'PARTNER',
    username: 'testpartner',
    email: 'partner@test.com',
    password: 'password123',
    role: 'partner',
    firstName: 'Test',
    lastName: 'Partner'
  },
  {
    type: 'STUDENT',
    username: 'teststudent',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    firstName: 'Test',
    lastName: 'Student'
  }
];

async function createAccount(account) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      username: account.username,
      email: account.email,
      password: account.password,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName
    });
    
    console.log(`✅ ${account.type} account created successfully!`);
    console.log(`   📧 Email: ${response.data.user.email}`);
    console.log(`   👤 Role: ${response.data.user.role}`);
    console.log(`   🆔 Username: ${response.data.user.username}`);
    return true;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already')) {
      console.log(`ℹ️  ${account.type} account already exists`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Password: ${account.password}`);
      return true;
    } else {
      console.log(`❌ Failed to create ${account.type} account`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

async function main() {
  console.log('');
  console.log('========================================');
  console.log('🔧 Creating Test Accounts');
  console.log('========================================');
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  console.log('');

  let allSuccess = true;

  for (const account of accounts) {
    console.log(`${account.type === 'PARTNER' ? '1️⃣' : '2️⃣'}  Creating ${account.type} account...`);
    const success = await createAccount(account);
    console.log('');
    if (!success) allSuccess = false;
  }

  console.log('========================================');
  if (allSuccess) {
    console.log('✅ All Test Accounts Ready!');
  } else {
    console.log('⚠️  Some accounts failed to create');
  }
  console.log('========================================');
  console.log('👨‍💼 Partner: partner@test.com / password123');
  console.log('🎓 Student: student@test.com / password123');
  console.log(`🌐 Backend: ${BACKEND_URL}`);
  console.log('========================================');
  console.log('');
  console.log('▶️  Next step: Run Partner API tests');
  console.log('   Command: node scripts/test-partner-api.js');
  console.log('');

  process.exit(allSuccess ? 0 : 1);
}

// Check if backend is running first
axios.get(`${BACKEND_URL}/health`)
  .then(() => {
    console.log(`✅ Backend is running on ${BACKEND_URL}`);
    main();
  })
  .catch(() => {
    console.log('');
    console.log('❌ Backend is NOT running!');
    console.log('');
    console.log('Please start the backend first:');
    console.log('   cd backend');
    console.log('   npm start');
    console.log('');
    process.exit(1);
  });
