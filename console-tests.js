// ========================================
// QUICK CONSOLE TESTS - Priority 1 Features
// ========================================
// Copy & paste vào Browser Console (F12) để test

console.log('🧪 Starting Priority 1 Tests...\n');

// Test 1: Check if AdminService exists
console.log('1️⃣ Checking AdminService...');
try {
  if (window.AdminService || localStorage.getItem('adminToken')) {
    console.log('✅ Admin context found');
  } else {
    console.log('⚠️ Please login as admin first');
  }
} catch (e) {
  console.log('❌ Error:', e.message);
}

// Test 2: Check localStorage tokens
console.log('\n2️⃣ Checking tokens...');
const token = localStorage.getItem('adminToken');
const user = localStorage.getItem('adminUser');
console.log('Token exists:', !!token);
console.log('User exists:', !!user);
if (token) {
  console.log('Token preview:', token.substring(0, 50) + '...');
}
if (user) {
  try {
    console.log('User data:', JSON.parse(user));
  } catch (e) {
    console.log('User data:', user);
  }
}

// Test 3: Check current route
console.log('\n3️⃣ Current location...');
console.log('Path:', window.location.pathname);
console.log('Full URL:', window.location.href);

// Test 4: Check React components mounted
console.log('\n4️⃣ Checking React components...');
const rootDiv = document.getElementById('root');
if (rootDiv && rootDiv.children.length > 0) {
  console.log('✅ React app mounted');
  console.log('Children count:', rootDiv.children.length);
} else {
  console.log('❌ React app not mounted');
}

// Test 5: Network check
console.log('\n5️⃣ Testing API connection...');
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Backend connected');
    console.log('Health check:', data);
  })
  .catch(err => {
    console.log('❌ Backend connection failed:', err.message);
    console.log('Make sure backend is running on port 5000');
  });

// Test 6: Test admin API endpoint
console.log('\n6️⃣ Testing admin dashboard API...');
const adminToken = localStorage.getItem('adminToken');
if (adminToken) {
  fetch('http://localhost:5000/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Admin API working');
      console.log('Dashboard stats:', data);
    })
    .catch(err => {
      console.log('❌ Admin API failed:', err.message);
    });
} else {
  console.log('⚠️ No admin token found. Please login first.');
}

// Helper functions for manual testing
console.log('\n========================================');
console.log('📝 HELPER FUNCTIONS AVAILABLE:');
console.log('========================================');
console.log('');
console.log('// Clear admin session');
console.log('clearAdmin()');
console.log('');
console.log('// Show current user');
console.log('showUser()');
console.log('');
console.log('// Test create user');
console.log('testCreateUser()');
console.log('');
console.log('// Check modals in DOM');
console.log('checkModals()');
console.log('');

// Clear admin function
window.clearAdmin = function() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('✅ Admin session cleared. Please refresh and login again.');
};

// Show user function
window.showUser = function() {
  const user = localStorage.getItem('adminUser');
  if (user) {
    try {
      console.log('Current user:', JSON.parse(user));
    } catch (e) {
      console.log('Current user:', user);
    }
  } else {
    console.log('No user found in localStorage');
  }
};

// Test create user (requires token)
window.testCreateUser = async function() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.log('❌ No admin token. Please login first.');
    return;
  }

  const testUser = {
    username: 'testuser' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'Test123456',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '1990-01-01',
    role: 'student',
    isActive: true,
    isEmailVerified: false
  };

  console.log('Creating test user:', testUser.username);

  try {
    const response = await fetch('http://localhost:5000/api/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User created successfully!');
      console.log('User data:', data.data.user);
    } else {
      console.log('❌ Failed to create user:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

// Check modals in DOM
window.checkModals = function() {
  const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="Modal"]');
  console.log('Modals found in DOM:', modals.length);
  modals.forEach((modal, index) => {
    console.log(`Modal ${index + 1}:`, {
      className: modal.className,
      visible: modal.style.display !== 'none',
      hasOverlay: !!modal.parentElement?.querySelector('[class*="Overlay"]')
    });
  });
};

console.log('\n✅ Test utilities loaded!');
console.log('Type clearAdmin(), showUser(), testCreateUser(), or checkModals() to use them.\n');
