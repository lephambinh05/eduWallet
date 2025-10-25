/**
 * Verify current admin token
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

// Giả sử token từ localStorage (copy từ browser console)
const sampleToken = 'PASTE_YOUR_TOKEN_HERE';

console.log('═══════════════════════════════════════');
console.log('   Token Verification');
console.log('═══════════════════════════════════════\n');

console.log('JWT_SECRET from .env:', process.env.JWT_SECRET);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('');

if (sampleToken === 'PASTE_YOUR_TOKEN_HERE') {
  console.log('⚠️  Please paste your token from browser localStorage');
  console.log('');
  console.log('How to get token:');
  console.log('1. Open browser console (F12)');
  console.log('2. Run: localStorage.getItem("adminToken")');
  console.log('3. Copy the token and paste it in this script');
} else {
  try {
    const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET);
    console.log('✅ Token is VALID!');
    console.log('Decoded:', decoded);
  } catch (error) {
    console.log('❌ Token is INVALID!');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 Solution: Logout and login again to get a new valid token');
  }
}
