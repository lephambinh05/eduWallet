// Direct MongoDB query to check certificates
const mongoose = require('mongoose');
require('dotenv').config();

const Certificate = require('./src/models/Certificate');
const Institution = require('./src/models/Institution');
const User = require('./src/models/User');

async function checkCertificates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet');
    console.log('✅ Connected!\n');

    // Count certificates
    const count = await Certificate.countDocuments();
    console.log(`📊 Total Certificates in DB: ${count}\n`);

    // Get all certificates with populated fields
    const certificates = await Certificate.find()
      .populate('student', 'firstName lastName email studentId')
      .populate('institution', 'name institutionId')
      .populate('course', 'courseName courseCode')
      .lean();

    console.log('📜 Certificates:');
    certificates.forEach((cert, i) => {
      console.log(`\n${i + 1}. Certificate ID: ${cert.certificateId}`);
      console.log(`   Student: ${cert.student?.firstName} ${cert.student?.lastName} (${cert.student?.studentId})`);
      console.log(`   Institution: ${cert.institution?.name || 'N/A'}`);
      console.log(`   Course: ${cert.course?.courseName || 'N/A'}`);
      console.log(`   Status: ${cert.status}`);
      console.log(`   Verified: ${cert.isVerified ? 'Yes' : 'No'}`);
      console.log(`   Created: ${cert.createdAt}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkCertificates();
