/**
 * Test Admin API Endpoints
 * Make sure to update the token and userId before running
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let TOKEN = ''; // Will be set after login

// Test configuration
const testAdmin = {
  email: 'admin@example.com',
  password: 'Admin123456'
};

const testUser = {
  username: 'test_user_' + Date.now(),
  email: 'testuser' + Date.now() + '@example.com',
  password: 'TestPass123',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: '2000-01-01',
  role: 'student'
};

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers.Authorization = `Bearer ${TOKEN}`;
  }
  return config;
});

// Test functions
async function login() {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testAdmin.email,
      password: testAdmin.password
    });
    
    TOKEN = response.data.data.accessToken;
    console.log('✅ Login successful');
    console.log('Token:', TOKEN.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function getDashboardStats() {
  console.log('\n📊 Testing Get Dashboard Stats...');
  try {
    const response = await api.get('/admin/dashboard');
    console.log('✅ Dashboard stats retrieved');
    console.log('Stats:', JSON.stringify(response.data.data.stats.overview, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function getAllUsers() {
  console.log('\n👥 Testing Get All Users...');
  try {
    const response = await api.get('/admin/users', {
      params: {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
      }
    });
    console.log('✅ Users retrieved');
    console.log(`Total users: ${response.data.data.pagination.total}`);
    console.log(`Current page: ${response.data.data.pagination.current}`);
    return response.data.data.users;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

async function searchUsers() {
  console.log('\n🔍 Testing Search Users...');
  try {
    const response = await api.get('/admin/users', {
      params: {
        search: 'test',
        page: 1,
        limit: 5
      }
    });
    console.log('✅ Search completed');
    console.log(`Found ${response.data.data.users.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function createUser() {
  console.log('\n➕ Testing Create User...');
  try {
    const response = await api.post('/admin/users', testUser);
    console.log('✅ User created successfully');
    console.log('User ID:', response.data.data.user._id);
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

async function getUserById(userId) {
  console.log('\n🔍 Testing Get User By ID...');
  try {
    const response = await api.get(`/admin/users/${userId}`);
    console.log('✅ User retrieved');
    console.log('Username:', response.data.data.user.username);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function updateUser(userId) {
  console.log('\n✏️ Testing Update User...');
  try {
    const response = await api.put(`/admin/users/${userId}`, {
      firstName: 'Updated',
      lastName: 'Name'
    });
    console.log('✅ User updated');
    console.log('New name:', response.data.data.user.firstName, response.data.data.user.lastName);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function updateUserRole(userId) {
  console.log('\n👑 Testing Update User Role...');
  try {
    const response = await api.patch(`/admin/users/${userId}/role`, {
      role: 'institution'
    });
    console.log('✅ Role updated');
    console.log('New role:', response.data.data.user.role);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function updateUserStatus(userId) {
  console.log('\n🔄 Testing Update User Status...');
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      isActive: false,
      reason: 'Test deactivation'
    });
    console.log('✅ Status updated');
    console.log('Is active:', response.data.data.user.isActive);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function blockUser(userId) {
  console.log('\n🚫 Testing Block User...');
  try {
    const response = await api.post(`/admin/users/${userId}/block`, {
      reason: 'Test blocking'
    });
    console.log('✅ User blocked');
    console.log('Is blocked:', response.data.data.user.isBlocked);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function unblockUser(userId) {
  console.log('\n✅ Testing Unblock User...');
  try {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    console.log('✅ User unblocked');
    console.log('Is blocked:', response.data.data.user.isBlocked);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function getUserActivities(userId) {
  console.log('\n📝 Testing Get User Activities...');
  try {
    const response = await api.get(`/admin/users/${userId}/activities`, {
      params: { page: 1, limit: 10 }
    });
    console.log('✅ Activities retrieved');
    console.log(`Total activities: ${response.data.data.pagination.total}`);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function getSystemActivities() {
  console.log('\n📋 Testing Get System Activities...');
  try {
    const response = await api.get('/admin/activities', {
      params: { page: 1, limit: 10 }
    });
    console.log('✅ Activities retrieved');
    console.log(`Total activities: ${response.data.data.pagination.total}`);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function deleteUser(userId) {
  console.log('\n🗑️ Testing Delete User...');
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    console.log('✅ User deleted');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function getSystemHealth() {
  console.log('\n💚 Testing Get System Health...');
  try {
    const response = await api.get('/admin/health');
    console.log('✅ Health check successful');
    console.log('Status:', response.data.data.health.status);
    console.log('Uptime:', Math.floor(response.data.data.health.uptime), 'seconds');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n═══════════════════════════════════════');
  console.log('   EduWallet - Admin API Tests');
  console.log('═══════════════════════════════════════');

  let createdUserId = null;

  try {
    // Login
    if (!await login()) {
      console.log('\n❌ Cannot proceed without login');
      return;
    }

    // Dashboard
    await getDashboardStats();

    // User management
    await getAllUsers();
    await searchUsers();
    
    // Create user
    const createdUser = await createUser();
    if (createdUser) {
      createdUserId = createdUser._id;
      
      // Test operations on created user
      await getUserById(createdUserId);
      await updateUser(createdUserId);
      await updateUserRole(createdUserId);
      await updateUserStatus(createdUserId);
      await blockUser(createdUserId);
      await unblockUser(createdUserId);
      await getUserActivities(createdUserId);
    }

    // System operations
    await getSystemActivities();
    await getSystemHealth();

    // Cleanup - delete test user
    if (createdUserId) {
      await deleteUser(createdUserId);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('   ✅ All tests completed!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
