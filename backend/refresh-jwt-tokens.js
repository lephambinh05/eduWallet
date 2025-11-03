const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'eduwallet_super_secret_jwt_key_2024';

const partners = [
  {
    folder: 'website-1-video',
    userId: '6902fb27137fbb370d9a8642',
    partnerId: 'partner_video_001'
  },
  {
    folder: 'website-2-quiz',
    userId: '6902fb50137fbb370d9a8647',
    partnerId: 'partner_quiz_002'
  },
  {
    folder: 'website-3-hybrid',
    userId: '6902fb5a137fbb370d9a864c',
    partnerId: 'partner_hybrid_003'
  }
];

console.log('🔑 Generating new JWT tokens for all partners...\n');

partners.forEach(partner => {
  // Generate new token (valid for 30 days)
  const token = jwt.sign(
    { id: partner.userId },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  console.log(`Partner: ${partner.partnerId}`);
  console.log(`User ID: ${partner.userId}`);
  console.log(`Token: ${token}\n`);
  
  // Update .env file
  const envPath = path.join(__dirname, '..', 'partner-demos', partner.folder, '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace JWT token line
    envContent = envContent.replace(
      /PARTNER_JWT_TOKEN=.*/,
      `PARTNER_JWT_TOKEN=${token}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated ${partner.folder}/.env\n`);
  } catch (error) {
    console.error(`❌ Error updating ${partner.folder}/.env:`, error.message);
  }
});

console.log('='.repeat(60));
console.log('✅ ALL TOKENS UPDATED!');
console.log('⚠️  Please restart all partner websites for changes to take effect.');
console.log('='.repeat(60));
