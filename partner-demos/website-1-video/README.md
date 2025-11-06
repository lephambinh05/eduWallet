# Partner Website 1 - Video & Quiz Learning Platform

## 🎯 Course Types

Website này hỗ trợ 3 loại khóa học:

1. **Video Course**: Học qua video YouTube
2. **Quiz Course**: Trắc nghiệm đánh giá kiến thức
3. **Hybrid Course**: Kết hợp cả video và quiz

## 🎯 Flow hoạt động

### 1. Partner tạo khóa học

Partner tạo khóa học trực tiếp trên website của họ thông qua API:

#### a) Tạo VIDEO COURSE

```bash
POST /api/courses
Content-Type: application/json

{
  "title": "Học lập trình Web cơ bản",
  "description": "Khóa học lập trình web từ cơ bản đến nâng cao",
  "issuer": "Đại học Công nghệ",
  "category": "Programming",
  "level": "Beginner",
  "credits": 3,
  "courseType": "video",
  "videoId": "dQw4w9WgXcQ",
  "videoDuration": 600,
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "link": "https://partner1.mojistudio.vn/courses/web-basic",
  "priceEdu": 100
}
```

#### b) Tạo QUIZ COURSE

```bash
POST /api/courses
Content-Type: application/json

{
  "title": "React Advanced Concepts Quiz",
  "description": "Test your knowledge of advanced React concepts",
  "issuer": "TechEdu Academy",
  "category": "Programming",
  "level": "Advanced",
  "credits": 2,
  "courseType": "quiz",
  "quiz": {
    "questions": [
      {
        "id": 1,
        "question": "What is the purpose of React Hooks?",
        "options": [
          "To add lifecycle methods to class components",
          "To use state and other React features in functional components",
          "To create custom HTML elements",
          "To optimize component rendering"
        ],
        "correctAnswer": 1,
        "explanation": "React Hooks allow you to use state and other React features without writing a class component."
      }
    ],
    "passingScore": 70,
    "timeLimit": 900
  },
  "skills": ["React", "JavaScript"],
  "link": "https://partner1.mojistudio.vn/courses/react-quiz",
  "priceEdu": 50
}
```

#### c) Tạo HYBRID COURSE (Video + Quiz)

```bash
POST /api/courses
Content-Type: application/json

{
  "title": "Python Programming Complete",
  "description": "Video lessons + knowledge assessment quiz",
  "courseType": "hybrid",
  "videoId": "rfscVS0vtbw",
  "videoDuration": 3600,
  "quiz": {
    "questions": [...],
    "passingScore": 60,
    "timeLimit": 600
  },
  "priceEdu": 80
}
```

Response:

```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "courseId": "video_1699123456_abc123",
    "title": "Học lập trình Web cơ bản",
    "courseType": "video",
    ...
  }
}
```

### 2. EduWallet đồng bộ khóa học

Partner vào **EduWallet Partner Panel** → **Quản lý khóa học** → Ấn nút **"Get khóa học"**

EduWallet gọi API:

```bash
GET https://partner1.mojistudio.vn/api/courses
x-api-key: partner_api_key_here
```

Response trả về danh sách khóa học:

```json
{
  "success": true,
  "courses": [
    {
      "courseId": "video_1699123456_abc123",
      "title": "Học lập trình Web cơ bản",
      "description": "...",
      "priceEdu": 100,
      ...
    }
  ]
}
```

EduWallet tự động lưu vào database của mình.

### 3. Người dùng mua khóa học

Người dùng mua khóa học trên EduWallet. **EduWallet tự động gửi webhook về Partner:**

```bash
POST https://partner1.mojistudio.vn/api/webhooks/enrollment-created
X-Partner-Id: partner_video_demo_001
X-Partner-Timestamp: 1699123456
X-Partner-Signature: sha256=abc123...
Content-Type: application/json

{
  "enrollmentId": "enroll_abc123",
  "userId": "690302badd7c9774cfd2a6a7",
  "courseId": "video_1699123456_abc123",
  "purchaseDate": "2025-11-06T10:00:00.000Z",
  "expiryDate": null,
  "metadata": {
    "priceEdu": 50,
    "transactionId": "tx_xyz789"
  }
}
```

Partner website nhận webhook và:
- ✅ Verify HMAC signature
- ✅ Tạo enrollment record trong database
- ✅ Grant access cho user
- ✅ Return access URL

Response:

```json
{
  "success": true,
  "message": "Enrollment created successfully",
  "enrollment": {
    "enrollmentId": "enroll_abc123",
    "userId": "690302badd7c9774cfd2a6a7",
    "courseId": "video_1699123456_abc123",
    "status": "active",
    "accessUrl": "https://partner1.mojistudio.vn/course/video_1699123456_abc123?student=690302badd7c9774cfd2a6a7"
  }
}
```

### 4. Người dùng học và hệ thống lưu tiến trình

Khi người dùng truy cập link:

#### a) Bắt đầu học (có access control)

```bash
POST /api/learning/start
{
  "studentId": "690302badd7c9774cfd2a6a7",
  "courseId": "video_1699123456_abc123"
}
```

Partner kiểm tra enrollment:
- ✅ User có enrollment cho course này không?
- ✅ Enrollment còn active không?
- ✅ Có expire date không?

Response (nếu có quyền):

```json
{
  "success": true,
  "message": "Learning session started",
  "data": {
    "progress": 0,
    "score": 0,
    "status": "In Progress",
    "startedAt": "2025-11-06T...",
    "courseType": "video"
  },
  "courseType": "video"
}
```

Response (nếu KHÔNG có quyền):

```json
{
  "success": false,
  "message": "Access denied. Please purchase this course on EduWallet first.",
  "courseId": "video_1699123456_abc123",
  "userId": "690302badd7c9774cfd2a6a7"
}
```

#### b) Video Course: Cập nhật tiến trình (mỗi 5 giây)

```bash
POST /api/learning/progress
{
  "studentId": "690302badd7c9774cfd2a6a7",
  "courseId": "video_1699123456_abc123",
  "watchedSeconds": 120
}
```

Response:

```json
{
  "success": true,
  "progress": 20,
  "score": 20,
  "status": "In Progress"
}
```

#### c) Quiz Course: Lấy câu hỏi

```bash
GET /api/quiz/:courseId/questions
```

Response:

```json
{
  "success": true,
  "quiz": {
    "questions": [
      {
        "id": 1,
        "question": "What is the purpose of React Hooks?",
        "options": ["Option A", "Option B", "Option C", "Option D"]
      }
    ],
    "totalQuestions": 10,
    "passingScore": 70,
    "timeLimit": 900
  }
}
```

#### d) Quiz Course: Nộp bài

```bash
POST /api/quiz/submit
{
  "studentId": "690302badd7c9774cfd2a6a7",
  "courseId": "quiz_abc123",
  "answers": {
    "1": 1,
    "2": 2,
    "3": 0
  }
}
```

Response:

```json
{
  "success": true,
  "passed": true,
  "score": 80,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "passingScore": 70,
  "grade": "B",
  "results": [
    {
      "questionId": 1,
      "question": "...",
      "userAnswer": 1,
      "correctAnswer": 1,
      "isCorrect": true,
      "explanation": "..."
    }
  ]
}
```

#### e) Hoàn thành khóa học (progress = 100 hoặc pass quiz)

```bash
POST /api/learning/complete
{
  "studentId": "690302badd7c9774cfd2a6a7",
  "courseId": "video_1699123456_abc123",
  "enrollmentId": "enrollment_id_from_eduwallet"
}
```

Hệ thống Partner tự động gửi webhook về EduWallet:

```bash
POST https://api-eduwallet.mojistudio.vn/api/webhooks/partner-updates
X-Partner-Id: partner_video_demo_001
X-Partner-Timestamp: 1699123456
X-Partner-Signature: sha256=abc123...

{
  "partnerId": "partner_video_demo_001",
  "eventType": "course_completed",
  "studentId": "690302badd7c9774cfd2a6a7",
  "courseId": "video_1699123456_abc123",
  "enrollmentId": "enrollment_id_from_eduwallet",
  "completedCourse": {
    "name": "Học lập trình Web cơ bản",
    "description": "Khóa học lập trình web từ cơ bản đến nâng cao",
    "issuer": "Đại học Công nghệ",
    "issueDate": "2025-11-05T10:30:00.000Z",
    "category": "Programming",
    "level": "Beginner",
    "credits": 3,
    "grade": "A",
    "score": 95,
    "status": "Completed",
    "progress": 100,
    "skills": ["HTML", "CSS", "JavaScript", "React"]
  }
}
```

## 🗄️ Database Structure

Partner sử dụng MongoDB riêng để lưu trữ 2 collections chính:

### 1. Courses Collection

#### Video Course

```javascript
{
  courseId: "video_1699123456_abc123",
  title: "Học lập trình Web cơ bản",
  description: "...",
  issuer: "Đại học Công nghệ",
  category: "Programming",
  level: "Beginner",
  credits: 3,
  courseType: "video",
  videoId: "dQw4w9WgXcQ",
  videoDuration: 600,
  skills: ["HTML", "CSS", "JavaScript", "React"],
  link: "https://partner1.mojistudio.vn/courses/web-basic",
  priceEdu: 100,
  createdAt: "2025-11-05T10:00:00.000Z",
  updatedAt: "2025-11-05T10:00:00.000Z"
}
```

#### Quiz Course

```javascript
{
  courseId: "quiz_1699123456_abc123",
  title: "React Advanced Quiz",
  courseType: "quiz",
  quiz: {
    questions: [
      {
        id: 1,
        question: "What is the purpose of React Hooks?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 1,
        explanation: "React Hooks allow you to use state..."
      }
    ],
    passingScore: 70,
    timeLimit: 900
  },
  skills: ["React", "JavaScript"],
  priceEdu: 50
}
```

#### Hybrid Course

```javascript
{
  courseId: "hybrid_1699123456_abc123",
  title: "Python Complete Course",
  courseType: "hybrid",
  videoId: "rfscVS0vtbw",
  videoDuration: 3600,
  quiz: {
    questions: [...],
    passingScore: 60,
    timeLimit: 600
  },
  priceEdu: 80
}
```

### 2. Enrollments Collection (🆕)

Track which users have purchased which courses:

```javascript
{
  enrollmentId: "enroll_abc123",
  userId: "690302badd7c9774cfd2a6a7",
  courseId: "video_1699123456_abc123",
  status: "active", // active | completed | expired
  purchaseDate: "2025-11-06T10:00:00.000Z",
  expiryDate: null,
  accessGranted: true,
  metadata: {
    priceEdu: 50,
    transactionId: "tx_xyz789"
  },
  createdAt: "2025-11-06T10:00:00.000Z",
  updatedAt: "2025-11-06T10:00:00.000Z"
}
```

**Indexes:**
- `enrollmentId` (unique)
- `userId + courseId` (compound index for fast lookups)

## ⚙️ Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and partner credentials
```

3. Seed sample courses (video, quiz, and hybrid):

```bash
node scripts/seed-courses.js
```

This will create:
- 1 Video course: JavaScript Fundamentals
- 1 Quiz course: React Advanced Concepts Quiz (10 questions)
- 1 Hybrid course: Python Programming Complete (video + 5 quiz questions)

4. Start the server:

```bash
npm start
# or for development
npm run dev
```

5. Test API:

```bash
# Get all courses
curl http://localhost:3001/api/courses

# Get quiz questions
curl http://localhost:3001/api/quiz/quiz_react_advanced_2024/questions

# Submit quiz
curl -X POST http://localhost:3001/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "690302badd7c9774cfd2a6a7",
    "courseId": "quiz_react_advanced_2024",
    "answers": {
      "1": 1,
      "2": 2,
      "3": 2,
      "4": 0,
      "5": 1,
      "6": 1,
      "7": 1,
      "8": 1,
      "9": 1,
      "10": 1
    }
  }'
```

## 📊 Data Flow Summary

**KHÔNG CÒN DỮ LIỆU CỨNG!** Tất cả data đều từ database:

1. ✅ Partner tạo khóa học → Lưu vào MongoDB của Partner
2. ✅ EduWallet gọi API GET /api/courses → Partner trả data từ MongoDB
3. ✅ EduWallet lưu vào database của EduWallet
4. ✅ User mua khóa học → EduWallet tạo link với studentId
5. ✅ User học → Partner lưu progress và gửi kết quả về EduWallet
6. ✅ Khi status = "Completed" → Partner webhook CompletedCourse về EduWallet

## 🔗 API Endpoints

### Course Management
| Method | Endpoint                            | Description                                  |
| ------ | ----------------------------------- | -------------------------------------------- |
| POST   | `/api/courses`                      | Partner tạo khóa học mới (video/quiz/hybrid) |
| GET    | `/api/courses`                      | EduWallet sync danh sách khóa học            |
| GET    | `/api/courses/:courseId`            | Lấy thông tin 1 khóa học                     |

### Enrollment Management (🆕)
| Method | Endpoint                                 | Description                                     |
| ------ | ---------------------------------------- | ----------------------------------------------- |
| POST   | `/api/webhooks/enrollment-created`       | EduWallet gọi khi user mua khóa học (webhook)  |
| GET    | `/api/enrollments/:userId`               | Lấy danh sách khóa học user đã mua              |

### Learning Progress
| Method | Endpoint                            | Description                                  |
| ------ | ----------------------------------- | -------------------------------------------- |
| POST   | `/api/learning/start`               | Bắt đầu học (có access control)               |
| POST   | `/api/learning/progress`            | Cập nhật tiến trình video                    |
| GET    | `/api/quiz/:courseId/questions`     | Lấy câu hỏi quiz (không có đáp án)           |
| POST   | `/api/quiz/submit`                  | Nộp bài quiz và nhận kết quả                 |
| POST   | `/api/learning/complete`            | Hoàn thành khóa học (gửi webhook về EduWallet)|
| GET    | `/api/student/:studentId/dashboard` | Xem dashboard học sinh                       |

## 🎓 CompletedCourse Data Format

Data trả về EduWallet khi hoàn thành khóa học:

```json
{
  "name": "Học lập trình Web cơ bản",
  "description": "Khóa học lập trình web từ cơ bản đến nâng cao",
  "issuer": "Đại học Công nghệ",
  "issueDate": "2025-11-05T10:30:00.000Z",
  "expiryDate": null,
  "category": "Programming",
  "level": "Beginner",
  "credits": 3,
  "grade": "A",
  "score": 95,
  "status": "Completed",
  "progress": 100,
  "modulesCompleted": 1,
  "totalModules": 1,
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "verificationUrl": null,
  "certificateUrl": null,
  "imageUrl": null
}
```
