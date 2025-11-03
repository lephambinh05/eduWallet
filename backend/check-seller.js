const mongoose = require('mongoose');
const Enrollment = require('./src/models/Enrollment');
const Partner = require('./src/models/Partner');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkEnrollmentSeller() {
  try {
    await mongoose.connect(DB_URI);
    
    const enrollment = await Enrollment.findById('69030da964401b21a712c8ff');
    console.log('Enrollment seller:', enrollment.seller);
    
    const partner = await Partner.findOne({ user: enrollment.seller });
    console.log('Partner found:', partner ? partner._id : 'NOT FOUND');
    console.log('Partner ID field:', partner ? partner.partnerId : 'N/A');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEnrollmentSeller();
