const mongoose = require('mongoose');
const Partner = require('./src/models/Partner');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function checkPartners() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    const allPartners = await Partner.find({});
    console.log(`\n=== TOTAL PARTNERS: ${allPartners.length} ===\n`);
    
    allPartners.forEach(partner => {
      console.log(`ID: ${partner._id}`);
      console.log(`Partner ID: ${partner.partnerId}`);
      console.log(`Name: ${partner.name}`);
      console.log(`Email: ${partner.email}`);
      console.log(`API Key: ${partner.apiKey || 'NONE'}`);
      console.log('---');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPartners();
