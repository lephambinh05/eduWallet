# Partner API Implementation - Backend Guide

## Cấu trúc Backend cần bổ sung

### 1. Partner Model Enhancement

```javascript
// backend/src/models/Partner.js
const partnerSchema = new mongoose.Schema({
  // ... existing fields
  apiEndpoints: {
    courseAccess: { type: String, required: true },
    learningProgress: { type: String, required: true },
    courseCatalog: String,
    certificateVerification: String
  },
  webhookUrl: String,
  apiKey: { type: String, required: true },
  apiSecretKey: { type: String, required: true }, // for webhook signing
  supportedFeatures: [String],
  rateLimiting: {
    requestsPerMinute: { type: Number, default: 60 },
    burstLimit: { type: Number, default: 100 }
  },
  lastSyncAt: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
});
```

### 2. Partner API Service

```javascript
// backend/src/services/partnerApiService.js
class PartnerApiService {
  constructor() {
    this.httpClient = axios.create({
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async createCourseAccess(partner, courseId, studentData) {
    const response = await this.httpClient.post(
      partner.apiEndpoints.courseAccess,
      {
        courseId,
        studentId: studentData.id,
        studentEmail: studentData.email,
        studentName: studentData.name,
        purchaseId: studentData.purchaseId,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      {
        headers: {
          'Authorization': `Bearer ${partner.apiKey}`,
          'X-EduWallet-Timestamp': Date.now(),
          'X-EduWallet-Signature': this.generateSignature(partner, payload)
        }
      }
    );
    
    return response.data;
  }

  async getLearningProgress(partner, studentId, courseId) {
    const response = await this.httpClient.get(
      `${partner.apiEndpoints.learningProgress}/${studentId}/${courseId}`,
      {
        headers: {
          'Authorization': `Bearer ${partner.apiKey}`
        }
      }
    );
    
    return response.data;
  }

  generateSignature(partner, payload) {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', partner.apiSecretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
```

### 3. Enhanced Enrollment Routes

```javascript
// backend/src/routes/enrollments.js - Bổ sung

// Sync learning progress from partner
router.post('/:id/sync-progress',
  authenticateToken,
  authorize(['seller', 'admin']),
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user')
      .populate('itemId');
    
    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Get partner info
    const partner = await Partner.findById(enrollment.seller);
    if (!partner || !partner.apiEndpoints.learningProgress) {
      throw new AppError('Partner API not configured', 400);
    }

    try {
      const progressData = await partnerApiService.getLearningProgress(
        partner,
        enrollment.user._id,
        enrollment.itemId._id
      );

      // Update enrollment with partner data
      if (progressData.success) {
        const data = progressData.data;
        
        // Update progress
        enrollment.progressPercent = data.progress.completionPercentage;
        enrollment.timeSpentSeconds = data.progress.totalTimeSpent;
        enrollment.lastAccessed = new Date(data.progress.lastAccessed);

        // Update assessments
        if (data.scores.assessments) {
          enrollment.metadata.assessments = data.scores.assessments.map(assessment => ({
            type: assessment.type,
            score: assessment.score,
            maxScore: assessment.maxScore,
            feedback: assessment.name,
            createdAt: new Date(assessment.completedAt)
          }));
        }

        // Update totals
        enrollment.totalPoints = data.scores.totalPoints;

        // Handle certificate
        if (data.certificate.issued) {
          enrollment.metadata.certificate = {
            issued: true,
            issuedAt: new Date(data.certificate.issuedAt),
            certificateUrl: data.certificate.certificateUrl,
            grade: data.certificate.grade,
            creditsEarned: data.certificate.creditsEarned
          };
          
          // Update status if completed
          if (data.progress.completionPercentage >= 100) {
            enrollment.status = 'completed';
          }
        }

        enrollment.markModified('metadata');
        await enrollment.save();

        // Send notification if certificate issued
        if (data.certificate.issued) {
          await emailService.sendCertificateNotification(
            enrollment.user.email,
            data.certificate,
            enrollment
          );
        }

        res.json({
          success: true,
          message: 'Progress synced successfully',
          data: { enrollment }
        });
      }
    } catch (error) {
      console.error('Partner API sync failed:', error);
      throw new AppError('Failed to sync with partner API', 500);
    }
  })
);

// Bulk sync all active enrollments
router.post('/sync-all-progress',
  authenticateToken,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const activeEnrollments = await Enrollment.find({ 
      status: 'in_progress',
      seller: { $exists: true }
    }).populate('seller user itemId');

    const results = [];
    for (const enrollment of activeEnrollments) {
      try {
        // Call sync for each enrollment
        const result = await syncEnrollmentProgress(enrollment);
        results.push({ enrollmentId: enrollment._id, success: true, result });
      } catch (error) {
        results.push({ 
          enrollmentId: enrollment._id, 
          success: false, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${results.length} enrollments`,
      data: { results }
    });
  })
);
```

### 4. Webhook Handler

```javascript
// backend/src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { asyncHandler } = require('../middleware/errorHandler');

// Partner webhook endpoint
router.post('/partner-updates',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const signature = req.headers['x-partner-signature'];
    const timestamp = req.headers['x-partner-timestamp'];
    const partnerId = req.headers['x-partner-id'];

    // Verify webhook signature
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(401).json({ error: 'Invalid partner' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', partner.apiSecretKey)
      .update(timestamp + req.body)
      .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) { // 5 minutes
      return res.status(401).json({ error: 'Request too old' });
    }

    const data = JSON.parse(req.body);

    // Process webhook data
    switch (data.eventType) {
      case 'progress_updated':
        await handleProgressUpdate(data);
        break;
      case 'course_completed':
        await handleCourseCompletion(data);
        break;
      case 'certificate_issued':
        await handleCertificateIssued(data);
        break;
      default:
        console.log('Unknown webhook event:', data.eventType);
    }

    res.json({ success: true });
  })
);

async function handleProgressUpdate(data) {
  const enrollment = await Enrollment.findOne({
    user: data.studentId,
    itemId: data.courseId
  });

  if (enrollment) {
    enrollment.progressPercent = data.data.progress.completionPercentage;
    enrollment.timeSpentSeconds = data.data.progress.totalTimeSpent;
    enrollment.lastAccessed = new Date();
    enrollment.markModified('metadata');
    await enrollment.save();
  }
}

async function handleCertificateIssued(data) {
  const enrollment = await Enrollment.findOne({
    user: data.studentId,
    itemId: data.courseId
  }).populate('user');

  if (enrollment && data.data.certificate) {
    enrollment.metadata.certificate = data.data.certificate;
    enrollment.status = 'completed';
    enrollment.markModified('metadata');
    await enrollment.save();

    // Send notification
    await emailService.sendCertificateNotification(
      enrollment.user.email,
      data.data.certificate,
      enrollment
    );
  }
}

module.exports = router;
```

### 5. Cron Jobs for Sync

```javascript
// backend/src/jobs/partnerSyncJob.js
const cron = require('node-cron');
const PartnerApiService = require('../services/partnerApiService');

class PartnerSyncJob {
  constructor() {
    this.partnerApiService = new PartnerApiService();
  }

  start() {
    // Sync every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Starting partner progress sync...');
      await this.syncAllActiveEnrollments();
    });

    // Daily partner course catalog sync
    cron.schedule('0 2 * * *', async () => {
      console.log('📚 Starting partner course catalog sync...');
      await this.syncPartnerCourses();
    });
  }

  async syncAllActiveEnrollments() {
    try {
      const activeEnrollments = await Enrollment.find({
        status: 'in_progress',
        seller: { $exists: true }
      }).populate('seller user itemId');

      for (const enrollment of activeEnrollments) {
        try {
          await this.syncSingleEnrollment(enrollment);
        } catch (error) {
          console.error(`Failed to sync enrollment ${enrollment._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Partner sync job failed:', error);
    }
  }

  async syncPartnerCourses() {
    const partners = await Partner.find({ 
      status: 'active',
      'apiEndpoints.courseCatalog': { $exists: true }
    });

    for (const partner of partners) {
      try {
        await this.syncPartnerCourseCatalog(partner);
      } catch (error) {
        console.error(`Failed to sync courses for partner ${partner._id}:`, error);
      }
    }
  }
}

module.exports = PartnerSyncJob;
```

### 6. Enhanced Email Templates

```javascript
// Add to emailService.js

async sendCertificateNotification(to, certificateData, enrollmentData) {
  const subject = `🏆 Chúc mừng! Bạn đã nhận được chứng chỉ: ${enrollmentData.courseTitle}`;
  
  const template = await this.loadTemplate('certificate-issued', {
    firstName: enrollmentData.user.firstName,
    courseName: enrollmentData.courseTitle,
    grade: certificateData.grade,
    creditsEarned: certificateData.creditsEarned,
    certificateUrl: certificateData.certificateUrl,
    issuedDate: new Date(certificateData.issuedAt).toLocaleDateString('vi-VN'),
    verificationUrl: `${process.env.FRONTEND_URL}/verify-certificate/${certificateData.certificateId}`
  });

  return this.sendEmail(to, subject, template);
}
```

## Deployment Checklist

### Environment Variables
```bash
# Partner API Configuration
PARTNER_API_TIMEOUT=30000
PARTNER_WEBHOOK_SECRET=your_webhook_secret
PARTNER_SYNC_INTERVAL=6h
PARTNER_API_RATE_LIMIT=60
```

### Database Indexes
```javascript
// Add these indexes for performance
db.enrollments.createIndex({ "user": 1, "itemId": 1 })
db.enrollments.createIndex({ "seller": 1, "status": 1 })
db.partners.createIndex({ "status": 1 })
```

### Monitoring
- API response times
- Webhook delivery success rates
- Sync job completion rates
- Partner API error rates

Tài liệu này cung cấp foundation hoàn chỉnh để implement partner API integration. Bạn có cần tôi bổ sung thêm phần nào không?