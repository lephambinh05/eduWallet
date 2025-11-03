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
    videoId: 'dQw4w9WgXcQ', // YouTube video ID
    videoDuration: 600, // 10 minutes in seconds
    skills: ['HTML', 'CSS', 'JavaScript', 'React']
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
  studentProgress.progress = Math.min(100, Math.round((watchedSeconds / course.videoDuration) * 100));
  
  // Update score based on progress
  studentProgress.score = studentProgress.progress;
  
  // Check if completed
  if (studentProgress.progress >= 100) {
    studentProgress.status = 'Completed';
    studentProgress.completedAt = new Date().toISOString();
    
    // Determine grade based on score
    if (studentProgress.score >= 95) studentProgress.grade = 'A+';
    else if (studentProgress.score >= 90) studentProgress.grade = 'A';
    else if (studentProgress.score >= 85) studentProgress.grade = 'B+';
    else if (studentProgress.score >= 80) studentProgress.grade = 'B';
    else studentProgress.grade = 'C';
  }
  
  res.json({
    success: true,
    progress: studentProgress.progress,
    score: studentProgress.score,
    status: studentProgress.status
  });
});

// Complete course and send to EduWallet
router.post('/learning/complete', async (req, res) => {
  const { studentId, courseId, enrollmentId } = req.body;
  
  if (!studentId || !courseId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const course = courses[courseId];
  const studentProgress = students[studentId]?.[courseId];
  
  if (!course || !studentProgress) {
    return res.status(404).json({ success: false, message: 'Course or progress not found' });
  }
  
  // Prepare CompletedCourse payload theo format mới
  const issueDate = new Date();
  const completedCourseData = {
    name: course.name,
    description: course.description,
    issuer: course.issuer,
    issueDate: issueDate.toISOString(),
    expiryDate: null,
    category: course.category,
    level: course.level,
    credits: course.credits,
    grade: studentProgress.grade || 'C',
    score: studentProgress.score,
    status: 'Completed',
    progress: 100,
    modulesCompleted: 1,
    totalModules: 1,
    skills: course.skills,
    verificationUrl: null,
    certificateUrl: null,
    imageUrl: null
  };
  
  try {
    // Nếu có enrollmentId, gọi endpoint complete enrollment
    if (enrollmentId) {
      const eduWalletUrl = `${process.env.EDUWALLET_API_URL}/api/partner/enrollment/${enrollmentId}/complete`;
      
      // Cần JWT token của partner để gọi endpoint này
      // Tạm thời gửi qua webhook endpoint
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const payload = {
        partnerId: process.env.PARTNER_ID,
        eventType: 'course_completed',
        studentId: studentId,
        courseId: courseId,
        enrollmentId: enrollmentId,
        completedCourse: completedCourseData
      };
      
      const bodyString = JSON.stringify(payload);
      const signature = createSignature(timestamp, bodyString);
      
      const webhookUrl = `${process.env.EDUWALLET_API_URL}${process.env.EDUWALLET_WEBHOOK_ENDPOINT}`;
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-Id': process.env.PARTNER_ID,
          'X-Partner-Timestamp': timestamp,
          'X-Partner-Signature': signature
        }
      });
      
      res.json({
        success: true,
        message: 'Course completed and sent to EduWallet',
        eduWalletResponse: response.data,
        completedCourse: completedCourseData,
        studentProgress
      });
    } else {
      // Fallback: gửi qua webhook nếu không có enrollmentId
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const payload = {
        partnerId: process.env.PARTNER_ID,
        eventType: 'course_completed',
        studentId: studentId,
        courseId: courseId,
        completedCourse: completedCourseData
      };
      
      const bodyString = JSON.stringify(payload);
      const signature = createSignature(timestamp, bodyString);
      
      const webhookUrl = `${process.env.EDUWALLET_API_URL}${process.env.EDUWALLET_WEBHOOK_ENDPOINT}`;
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Partner-Id': process.env.PARTNER_ID,
          'X-Partner-Timestamp': timestamp,
          'X-Partner-Signature': signature
        }
      });
      
      res.json({
        success: true,
        message: 'Course completed and sent to EduWallet',
        eduWalletResponse: response.data,
        completedCourse: completedCourseData,
        studentProgress
      });
    }
  } catch (error) {
    console.error('Error sending to EduWallet:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send to EduWallet',
      error: error.response?.data || error.message,
      completedCourse: completedCourseData,
      studentProgress
    });
  }
});

// Get student progress
router.get('/learning/progress/:studentId/:courseId', (req, res) => {
  const { studentId, courseId } = req.params;
  
  const progress = students[studentId]?.[courseId];
  
  if (!progress) {
    return res.status(404).json({ success: false, message: 'Progress not found' });
  }
  
  res.json({ success: true, progress });
});

module.exports = router;
