const mongoose = require('mongoose');
const Partner = require('./src/models/Partner');

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduwallet';

async function getPartnerApiKeys() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    const partners = await Partner.find({
      partnerId: {
        $in: ['partner_video_001', 'partner_quiz_002', 'partner_hybrid_003']
      }
    }).select('partnerId name apiKey');

    console.log('\n=== PARTNER API KEYS ===\n');
    partners.forEach(partner => {
      console.log(`Partner: ${partner.partnerId}`);
      console.log(`Name: ${partner.name}`);
      console.log(`API Key: ${partner.apiKey || 'NOT GENERATED YET'}`);
      console.log('---');
    });

    if (partners.some(p => !p.apiKey)) {
      console.log('\nSome partners don\'t have API keys. Generating...\n');
      
      for (const partner of partners) {
        if (!partner.apiKey) {
          partner.apiKey = require('crypto').randomBytes(32).toString('hex');
          partner.apiKeyCreatedAt = new Date();
          await partner.save();
          console.log(`Generated API key for ${partner.partnerId}: ${partner.apiKey}`);
        }
      }
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getPartnerApiKeys();
