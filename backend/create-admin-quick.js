/**
 * Quick script to create admin user without interactive input
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdminQuick() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('Email: admin@example.com');
      console.log('Password: Admin123456 (if not changed)');
      console.log('Role:', existingAdmin.role);
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123456',
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
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

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123456');
    console.log('Role:', admin.role);
    console.log('\n🔑 You can now login with these credentials!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdminQuick();
