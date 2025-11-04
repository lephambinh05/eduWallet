const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// Mock database - in production, use real database
const students = {};
const courses = {
  'course_001': {
    id: 'course_001',
    name: 'Học lập trình Web cơ bản',
    description: 'Khóa học lập trình web từ cơ bản đến nâng cao',
    issuer: 'Đại học Công nghệ',
    category: 'Programming',
    level: 'Beginner',
    credits: 3,
    priceEdu: 50,
    videoId: 'dQw4w9WgXcQ', // YouTube video ID
    videoDuration: 600, // 10 minutes in seconds
    skills: ['HTML', 'CSS', 'JavaScript', 'React']
  },
  'course_002': {
    id: 'course_002',
    name: 'JavaScript nâng cao',
    description: 'Khóa học JavaScript ES6+ và các kỹ thuật lập trình nâng cao',
    issuer: 'Đại học Công nghệ',
    category: 'Programming',
    level: 'Intermediate',
    credits: 4,
    priceEdu: 75,
    videoId: 'M7lc1UVf-VE', // YouTube video ID
    videoDuration: 900, // 15 minutes
    skills: ['JavaScript', 'ES6+', 'Async/Await', 'Promises']
  },
  'course_003': {
    id: 'course_003',
    name: 'React.js từ đầu',
    description: 'Xây dựng ứng dụng web hiện đại với React',
    issuer: 'Đại học Công nghệ',
    category: 'Programming',
    level: 'Advanced',
    credits: 5,
    priceEdu: 100,
    videoId: 'w7ejDZ8SWv8', // YouTube video ID
    videoDuration: 1200, // 20 minutes
    skills: ['React', 'JSX', 'Hooks', 'State Management']
  }
};

// Helper function to create HMAC signature
function createSignature(timestamp, body) {
  const secret = process.env.PARTNER_SECRET;
  const payload = `${timestamp}${body}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Get course information
router.get('/courses/:courseId', (req, res) => {
  const { courseId } = req.params;
  const course = courses[courseId];
  
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  
  res.json({ success: true, course });
});

// Get all courses
router.get('/courses', (req, res) => {
  res.json({ success: true, courses: Object.values(courses) });
});

// Start learning session
router.post('/learning/start', (req, res) => {
  const { studentId, courseId } = req.body;
  
  if (!studentId || !courseId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const course = courses[courseId];
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  
  // Initialize student progress
  if (!students[studentId]) {
    students[studentId] = {};
  }
  
  students[studentId][courseId] = {
    progress: 0,
    score: 0,
    status: 'In Progress',
    startedAt: new Date().toISOString(),
    lastWatchedSecond: 0
  };
  
  res.json({
    success: true,
    message: 'Learning session started',
    data: students[studentId][courseId]
  });
});

// Update progress (called periodically as student watches video)
router.post('/learning/progress', (req, res) => {
  const { studentId, courseId, watchedSeconds } = req.body;
  
  if (!studentId || !courseId || watchedSeconds === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const course = courses[courseId];
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  
  if (!students[studentId] || !students[studentId][courseId]) {
    return res.status(400).json({ success: false, message: 'Learning session not started' });
  }
  
  const studentProgress = students[studentId][courseId];
  studentProgress.lastWatchedSecond = watchedSeconds;
  studentProgress.progress = Math.min(100, Math.floor((watchedSeconds / course.videoDuration) * 100));
  
  res.json({
    success: true,
    data: {
      progress: studentProgress.progress,
      watchedSeconds: studentProgress.lastWatchedSecond
    }
  });
});

// Complete course
router.post('/learning/complete', async (req, res) => {
  const { studentId, courseId, finalScore } = req.body;
  
  if (!studentId || !courseId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const course = courses[courseId];
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  
  if (!students[studentId] || !students[studentId][courseId]) {
    return res.status(400).json({ success: false, message: 'Learning session not started' });
  }
  
  const studentProgress = students[studentId][courseId];
  studentProgress.status = 'Completed';
  studentProgress.score = finalScore || 100;
  studentProgress.progress = 100;
  studentProgress.completedAt = new Date().toISOString();
  
  // Send completion data to EduWallet via webhook
  try {
    const timestamp = Date.now();
    const webhookData = {
      userId: studentId,
      courseId: course.id,
      courseTitle: course.name,
      issuerId: process.env.PARTNER_ID,
      category: course.category,
      level: course.level,
      credits: course.credits,
      grade: finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : 'C',
      score: finalScore || 100,
      completedAt: studentProgress.completedAt,
      skills: course.skills,
      certificateUrl: `https://example.com/certificates/${studentId}_${courseId}`,
      verificationUrl: `https://example.com/verify/${studentId}_${courseId}`
    };
    
    const bodyString = JSON.stringify(webhookData);
    const signature = createSignature(timestamp, bodyString);
    
    const eduWalletUrl = process.env.EDUWALLET_API_URL || 'http://localhost:3001';
    
    await axios.post(
      `${eduWalletUrl}${process.env.EDUWALLET_WEBHOOK_ENDPOINT}`,
      webhookData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
          'X-Partner-ID': process.env.PARTNER_ID
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Course completed and data sent to EduWallet',
      data: studentProgress
    });
    
  } catch (error) {
    console.error('Error sending to EduWallet:', error.message);
    res.json({
      success: true,
      message: 'Course completed but failed to send to EduWallet',
      data: studentProgress,
      webhookError: error.message
    });
  }
});

module.exports = router;
