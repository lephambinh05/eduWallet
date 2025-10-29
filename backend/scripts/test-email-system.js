const emailService = require('../src/services/emailService');
require('dotenv').config();

async function testEmailSystem() {
  console.log('🧪 Testing EduWallet Email System...');
  console.log('📧 Email configuration:');
  console.log(`   HOST: ${process.env.EMAIL_HOST}`);
  console.log(`   PORT: ${process.env.EMAIL_PORT}`);
  console.log(`   USER: ${process.env.EMAIL_USER}`);
  console.log(`   FROM: ${process.env.EMAIL_FROM}`);
  console.log('─'.repeat(50));

  // Test 1: Configuration test
  console.log('🔧 Test 1: Email service configuration...');
  const configTest = await emailService.testConfiguration();
  if (configTest.success) {
    console.log('✅ Email service configured successfully');
  } else {
    console.log('❌ Email service configuration failed:', configTest.error);
    return;
  }

  const testEmail = process.env.EMAIL_USER || 'lephambinh05@gmail.com';
  
  // Test 2: Welcome email
  console.log('\n📬 Test 2: Sending welcome email...');
  try {
    const welcomeResult = await emailService.sendWelcomeEmail(testEmail, {
      firstName: 'Test',
      lastName: 'User', 
      username: 'testuser',
      email: testEmail
    });
    
    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully');
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }
  } catch (error) {
    console.log('❌ Welcome email error:', error.message);
  }

  // Test 3: Course purchase notification
  console.log('\n🛒 Test 3: Sending course purchase notification...');
  try {
    const purchaseResult = await emailService.sendCoursePurchaseNotification(testEmail, {
      name: 'Advanced JavaScript Course',
      priceEdu: 100,
      owner: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }, {
      buyer: {
        firstName: 'Test',
        lastName: 'User'
      },
      accessLink: 'https://partner.com/course/123?token=test',
      createdAt: new Date()
    });

    if (purchaseResult.success) {
      console.log('✅ Course purchase email sent successfully');
    } else {
      console.log('❌ Course purchase email failed:', purchaseResult.error);
    }
  } catch (error) {
    console.log('❌ Course purchase email error:', error.message);
  }

  // Test 4: Assessment notification
  console.log('\n📊 Test 4: Sending assessment notification...');
  try {
    const assessmentResult = await emailService.sendNewAssessmentNotification(testEmail, {
      type: 'quiz',
      score: 85,
      maxScore: 100,
      feedback: 'Great work! Keep it up.',
      createdAt: new Date()
    }, {
      user: {
        firstName: 'Test'
      },
      itemName: 'Advanced JavaScript Course',
      _id: 'test_enrollment_123'
    });

    if (assessmentResult.success) {
      console.log('✅ Assessment email sent successfully');
    } else {
      console.log('❌ Assessment email failed:', assessmentResult.error);
    }
  } catch (error) {
    console.log('❌ Assessment email error:', error.message);
  }

  // Test 5: NFT mint notification
  console.log('\n🎨 Test 5: Sending NFT mint notification...');
  try {
    const nftResult = await emailService.sendNFTMintNotification(testEmail, {
      name: 'Portfolio NFT #123',
      tokenId: '123',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12'
    }, {
      firstName: 'Test'
    });

    if (nftResult.success) {
      console.log('✅ NFT mint email sent successfully');
    } else {
      console.log('❌ NFT mint email failed:', nftResult.error);
    }
  } catch (error) {
    console.log('❌ NFT mint email error:', error.message);
  }

  // Test 6: Token reward notification
  console.log('\n💰 Test 6: Sending token reward notification...');
  try {
    const tokenResult = await emailService.sendTokenRewardNotification(testEmail, {
      amount: 50,
      reason: 'Course completion bonus',
      transactionHash: '0x1234567890abcdef1234567890abcdef12345678'
    }, {
      firstName: 'Test'
    });

    if (tokenResult.success) {
      console.log('✅ Token reward email sent successfully');
    } else {
      console.log('❌ Token reward email failed:', tokenResult.error);
    }
  } catch (error) {
    console.log('❌ Token reward email error:', error.message);
  }

  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Email system testing completed!');
  console.log('💡 Tips:');
  console.log('   - Check spam folder if emails not received');
  console.log('   - Verify EMAIL_USER and EMAIL_PASS in .env');
  console.log('   - For Gmail, use App Password instead of regular password');
  console.log('   - Enable 2FA and generate App Password at: https://myaccount.google.com/apppasswords');
}

// Run tests
if (require.main === module) {
  testEmailSystem().catch(console.error);
}

module.exports = { testEmailSystem };