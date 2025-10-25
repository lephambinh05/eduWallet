/**
 * Script to create the first admin user
 * Run: node create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./src/models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get admin details from user input
    console.log('📝 Please enter admin details:\n');
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password (min 8 characters): ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    
    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      console.error('\n❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n❌ Password must be at least 8 characters long!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.error('\n❌ User with this email or username already exists!');
      process.exit(1);
    }

    // Create admin user
    console.log('\n⏳ Creating admin user...');
    const admin = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: new Date('1990-01-01'), // Default date
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      permissions: [
        'create_certificate',
        'verify_certificate',
        'manage_institutions',
        'manage_users',
        'manage_system',
        'view_analytics'
      ]
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`ID: ${admin._id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔑 You can now login with these credentials!\n');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
console.log('\n═══════════════════════════════════════');
console.log('   EduWallet - Create Admin User');
console.log('═══════════════════════════════════════\n');

createAdmin();
