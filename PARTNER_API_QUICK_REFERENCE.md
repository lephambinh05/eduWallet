# 🚀 Partner API Quick Reference

## 🔑 Authentication

```javascript
// JWT Token (partner endpoints)
headers: { Authorization: `Bearer ${token}` }

// API Key (public endpoints)
headers: { 'X-API-Key': apiKey }
// OR
?apiKey=your-api-key
```

---

## 📋 Endpoint Cheatsheet

### API Keys
```javascript
POST   /api/partner/apikey/generate          // Generate key
GET    /api/partner/apikey                   // Get metadata
POST   /api/partner/apikey/reveal            // Reveal key
GET    /api/partner/apikey/validate          // Validate key
```

### Courses
```javascript
POST   /api/partner/courses                  // Create
GET    /api/partner/courses                  // List
PUT    /api/partner/courses/:id              // Update
PATCH  /api/partner/courses/:id/publish      // Publish
GET    /api/partner/public/course/:id        // Get (public)
GET    /api/partner/public-courses           // Search (public)
```

### Enrollments
```javascript
POST   /api/partner/courses/:id/purchase           // Purchase
GET    /api/partner/my-enrollments                 // My enrollments
GET    /api/partner/enrollment/:id                 // Get details
PATCH  /api/partner/enrollment/:id/progress        // Update progress
GET    /api/partner/public/enrollment/student/:id  // Get student (public)
GET    /api/partner/courses/:id/students           // Get students
```

### Analytics
```javascript
GET    /api/partner/sales                    // Sales
GET    /api/partner/learners                 // Learners
```

### Completed
```javascript
POST   /api/partner/enrollment/:id/complete        // Mark complete
GET    /api/partner/completed-courses/:userId      // User's completed
GET    /api/partner/public/completed-courses/user/:userId  // Public
PATCH  /api/partner/completed-course/:id           // Update
```

---

## 💡 Common Patterns

### 1. Create Course
```javascript
const response = await axios.post('/api/partner/courses', {
  title: 'My Course',
  description: 'Course description',
  link: 'https://example.com/course',
  priceEdu: 100
}, {
  headers: { Authorization: `Bearer ${token}` }
});

const courseId = response.data.data.course._id;
```

### 2. Publish Course
```javascript
await axios.patch(`/api/partner/courses/${courseId}/publish`, 
  { publish: true },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### 3. Update Progress
```javascript
await axios.patch(`/api/partner/enrollment/${enrollmentId}/progress`, {
  progressPercent: 75,
  totalPoints: 1200,
  timeSpentSeconds: 3600,
  status: 'in_progress'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 4. Mark Complete
```javascript
await axios.post(`/api/partner/enrollment/${enrollmentId}/complete`, {
  category: 'Programming',
  level: 'Advanced',
  credits: 3,
  grade: 'A',
  score: 1500,
  skills: ['JavaScript', 'React'],
  certificateUrl: 'https://...'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 5. Get Course with API Key
```javascript
const response = await axios.get(`/api/partner/public/course/${courseId}`, {
  headers: { 'X-API-Key': apiKey }
});
```

---

## 📊 Response Format

### Success
```javascript
{
  success: true,
  message: "Operation successful",
  data: { ... }
}
```

### Error
```javascript
{
  success: false,
  message: "Error message"
}
```

---

## 🔒 Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## 🎯 CompletedCourse Fields

```javascript
{
  name: String,              // Required
  description: String,
  issuer: String,            // Required
  category: String,          // "Programming", "Design", etc.
  level: String,             // "Beginner", "Intermediate", "Advanced"
  credits: Number,           // Academic credits
  grade: String,             // "A+", "A", "B", etc.
  score: Number,             // Total score/points
  skills: [String],          // ["JavaScript", "React"]
  certificateUrl: String,
  verificationUrl: String,
  imageUrl: String,
  modulesCompleted: Number,
  totalModules: Number
}
```

---

## 🚀 Quick Test

```bash
# Run all tests
test-partner-api.bat

# Or manually
cd backend
node scripts/test-partner-api.js
```

---

**Full Docs:** PARTNER_API_DOCUMENTATION.md  
**Test Guide:** PARTNER_API_TEST_GUIDE.md
