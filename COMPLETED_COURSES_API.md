# API Quản lý Khóa học Hoàn thành (Completed Courses)

## 📋 Tổng quan

Hệ thống này tự động chuyển đổi **Enrollment** sang **CompletedCourse** khi học viên hoàn thành khóa học (status = "completed"). CompletedCourse chứa đầy đủ thông tin chi tiết về kết quả học tập theo format chuẩn.

## 🎯 Tính năng chính

### 1. Tự động tạo CompletedCourse

- Khi Partner cập nhật `status: "completed"` qua API `/enrollment/:id/progress`
- System tự động tạo record CompletedCourse với đầy đủ thông tin
- Bao gồm: score, grade, skills, certificate URL, progress, modules, etc.

### 2. Format dữ liệu chuẩn

```json
{
  "_id": "68eceff2fc4d8abe6135da87",
  "enrollmentId": "...",
  "userId": "68ecef57f2d3ddc8fd99e5be",
  "name": "Cơ sở dữ liệu",
  "description": "Khóa học về thiết kế và quản lý cơ sở dữ liệu",
  "issuer": "Đại học Công nghệ Thông tin",
  "issuerId": "...",
  "issueDate": "2024-01-15T00:00:00.000Z",
  "expiryDate": null,
  "category": "Programming",
  "level": "Intermediate",
  "credits": 3,
  "grade": "A+",
  "score": 98,
  "status": "Completed",
  "progress": 100,
  "modulesCompleted": 10,
  "totalModules": 10,
  "skills": ["SQL", "Database Design", "MySQL", "PostgreSQL"],
  "verificationUrl": null,
  "certificateUrl": "https://example.com/cert.pdf",
  "imageUrl": null,
  "metadata": {},
  "createdAt": "2025-10-13T12:26:26.785Z",
  "updatedAt": "2025-10-13T12:26:26.785Z",
  "issueDateFormatted": "15/1/2024",
  "expiryDateFormatted": null,
  "scoreDisplay": "98%"
}
```

## 🔌 API Endpoints

### 1. Tự động tạo khi update progress (Recommended)

**PATCH** `/api/partner/enrollment/:enrollmentId/progress`

Khi update status sang "completed", system tự động tạo CompletedCourse.

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progressPercent": 100,
    "totalPoints": 98,
    "status": "completed",
    "category": "Programming",
    "level": "Intermediate",
    "credits": 3,
    "grade": "A+",
    "skills": ["SQL", "Database Design", "MySQL", "PostgreSQL"],
    "certificateUrl": "https://example.com/cert.pdf",
    "verificationUrl": "https://example.com/verify",
    "imageUrl": "https://example.com/badge.png",
    "modulesCompleted": 10,
    "totalModules": 10
  }' \
  https://api-eduwallet.mojistudio.vn/api/partner/enrollment/ENROLLMENT_ID/progress
```

**Response:**

```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "enrollment": {
      /* ... */
    },
    "completedCourse": {
      "_id": "...",
      "name": "...",
      "score": 98,
      "grade": "A+"
      /* ... full course data ... */
    }
  }
}
```

### 2. Tạo thủ công

**POST** `/api/partner/enrollment/:enrollmentId/complete`

Partner chủ động đánh dấu enrollment là hoàn thành và tạo CompletedCourse.

**Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Programming",
    "level": "Advanced",
    "credits": 4,
    "grade": "A",
    "score": 92,
    "skills": ["Node.js", "Express", "MongoDB"],
    "certificateUrl": "https://example.com/cert.pdf",
    "modulesCompleted": 12,
    "totalModules": 12
  }' \
  https://api-eduwallet.mojistudio.vn/api/partner/enrollment/ENROLLMENT_ID/complete
```

### 3. Lấy danh sách completed courses

**GET** `/api/partner/completed-courses/:userId`

Lấy tất cả completed courses của user (yêu cầu partner auth).

**Request:**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api-eduwallet.mojistudio.vn/api/partner/completed-courses/USER_ID?page=1&limit=50"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 50,
    "courses": [
      /* array of completed courses */
    ]
  }
}
```

### 4. Public API - Lấy completed courses

**GET** `/api/partner/public/completed-courses/user/:userId`

Lấy completed courses bằng API key (chỉ trả về courses do partner này phát hành).

**Request:**

```bash
curl -H "X-Partner-API-Key: YOUR_API_KEY" \
  "https://api-eduwallet.mojistudio.vn/api/partner/public/completed-courses/user/USER_ID"
```

### 5. Cập nhật completed course

**PATCH** `/api/partner/completed-course/:courseId`

Cập nhật thông tin chi tiết của completed course.

**Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "category": "Data Science",
    "level": "Advanced",
    "credits": 5,
    "grade": "A+",
    "score": 99,
    "skills": ["Python", "Pandas", "Scikit-learn"],
    "certificateUrl": "https://example.com/new-cert.pdf"
  }' \
  https://api-eduwallet.mojistudio.vn/api/partner/completed-course/COURSE_ID
```

## 📊 Grade Calculation

System tự động tính grade dựa trên score nếu không được cung cấp:

- **95-100**: A+
- **90-94**: A
- **85-89**: B+
- **80-84**: B
- **75-79**: C+
- **70-74**: C
- **65-69**: D+
- **60-64**: D
- **<60**: F

## 🔄 Workflow Tích hợp

### Website Demo của Partner

#### Website 1: Xem Video

```javascript
// Khi user hoàn thành video
const updateProgress = async () => {
  await axios.patch(
    `/api/partner/enrollment/${enrollmentId}/progress`,
    {
      progressPercent: 100,
      totalPoints: 100,
      status: "completed",
      timeSpentSeconds: 3600,
      category: "Video Learning",
      level: "Beginner",
      skills: ["Video Comprehension"],
      metadata: {
        videoId: "abc123",
        completedDate: new Date(),
      },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // System tự động tạo CompletedCourse
};
```

#### Website 2: Quiz

```javascript
// Khi user hoàn thành 2 tasks quiz (10 câu)
const completeQuiz = async () => {
  const score = calculateScore(); // 0-100

  await axios.patch(
    `/api/partner/enrollment/${enrollmentId}/progress`,
    {
      progressPercent: 100,
      totalPoints: score,
      status: "completed",
      category: "Assessment",
      level: "Intermediate",
      credits: 2,
      skills: ["Problem Solving", "Critical Thinking"],
      modulesCompleted: 2,
      totalModules: 2,
      metadata: {
        task1Score: 45,
        task2Score: 50,
        totalQuestions: 10,
        correctAnswers: 9,
      },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
```

#### Website 3: Video + Quiz

```javascript
// Khi user hoàn thành cả 2 tasks
const completeHybridCourse = async () => {
  await axios.patch(
    `/api/partner/enrollment/${enrollmentId}/progress`,
    {
      progressPercent: 100,
      totalPoints: 95,
      status: "completed",
      category: "Hybrid Learning",
      level: "Advanced",
      credits: 3,
      grade: "A",
      skills: ["Video Analysis", "Quiz Mastery", "Mixed Media Learning"],
      modulesCompleted: 2,
      totalModules: 2,
      certificateUrl: "https://partner-site.com/certs/user123.pdf",
      metadata: {
        videoProgress: 100,
        videoTimeSpent: 1800,
        quizScore: 90,
        quizAttempts: 1,
      },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
```

## 🔒 Security & Permissions

- **Partner Auth**: Chỉ partner owner có thể update/complete enrollments của khóa học của mình
- **API Key**: Public endpoints chỉ trả về courses do partner đó phát hành
- **Validation**: System validate ownership trước khi cho phép thao tác

## 💡 Best Practices

1. **Luôn cung cấp đầy đủ thông tin khi complete**:

   - category, level, credits
   - skills array (càng chi tiết càng tốt)
   - certificateUrl nếu có
   - modulesCompleted/totalModules để tracking chi tiết

2. **Sử dụng metadata cho thông tin bổ sung**:

   ```json
   {
     "metadata": {
       "courseType": "online",
       "instructor": "John Doe",
       "duration": "4 weeks",
       "completionTime": "3 hours",
       "attempts": 1,
       "feedback": "Excellent performance"
     }
   }
   ```

3. **Auto-calculate grade**:

   - Nếu không truyền `grade`, system tự động tính từ `score`
   - Hoặc truyền grade custom theo tiêu chí riêng của partner

4. **Handle duplicate completion**:
   - System tự động check duplicate (1 enrollment = 1 completed course)
   - Nếu đã tồn tại, không tạo mới

## 📈 Reporting & Analytics

Partner có thể query completed courses để:

- Thống kê số lượng học viên hoàn thành
- Phân tích điểm số trung bình
- Tracking skills phổ biến
- Export dữ liệu cho báo cáo

```javascript
// Example: Get all completed courses and calculate stats
const stats = await axios.get(
  '/api/partner/completed-courses/USER_ID?limit=1000',
  { headers: { Authorization: `Bearer ${token}` } }
);

const courses = stats.data.data.courses;
const avgScore = courses.reduce((sum, c) => sum + c.score, 0) / courses.length;
const topSkills = /* count frequency of skills */;
```

## 🚀 Next Steps

1. Start backend: `cd backend && npm start`
2. Test với Postman/curl
3. Tích hợp vào 3 partner demo websites
4. Monitor logs để verify CompletedCourse được tạo tự động
5. Check database collection `completedcourses`

## 📚 Related Documentation

- **PARTNER_API_DEMO.md** - Tài liệu đầy đủ tất cả Partner APIs
- **Partner Panel** - `/partner/api-docs` - UI để quản lý API keys và xem docs
- **Models**:
  - `backend/src/models/CompletedCourse.js` - Schema definition
  - `backend/src/models/Enrollment.js` - Original enrollment data
