# Quiz & Hybrid Course Features

## 🎯 Tổng quan

Website partner giờ đã hỗ trợ **3 loại khóa học**:

1. **VIDEO**: Học qua video YouTube
2. **QUIZ**: Trắc nghiệm đánh giá kiến thức
3. **HYBRID**: Kết hợp cả video và quiz

## 📋 Course Schema Updates

### Thêm fields mới:

```javascript
{
  courseType: 'video' | 'quiz' | 'hybrid',  // Loại khóa học

  // Video fields (cho video & hybrid)
  videoId: String,
  videoDuration: Number,

  // Quiz fields (cho quiz & hybrid)
  quiz: {
    questions: [{
      id: Number,
      question: String,
      options: [String],          // 4 options
      correctAnswer: Number,       // Index 0-3
      explanation: String
    }],
    passingScore: Number,          // % điểm tối thiểu để pass (default: 70)
    timeLimit: Number              // Giây (optional)
  }
}
```

## 🔌 API Endpoints Mới

### 1. GET `/api/quiz/:courseId/questions`

Lấy câu hỏi quiz (KHÔNG bao gồm đáp án đúng - để tránh gian lận)

**Response:**

```json
{
  "success": true,
  "quiz": {
    "questions": [
      {
        "id": 1,
        "question": "What is React?",
        "options": ["A library", "A framework", "A language", "An IDE"]
      }
    ],
    "totalQuestions": 10,
    "passingScore": 70,
    "timeLimit": 900
  }
}
```

### 2. POST `/api/quiz/submit`

Nộp bài quiz và nhận kết quả chấm điểm

**Request:**

```json
{
  "studentId": "690302badd7c9774cfd2a6a7",
  "courseId": "quiz_abc123",
  "answers": {
    "1": 0,
    "2": 2,
    "3": 1
  }
}
```

**Response:**

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
      "question": "What is React?",
      "userAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "explanation": "React is a JavaScript library for building UI."
    }
  ]
}
```

## 📊 Learning Flow Updates

### Video Course Flow (không đổi):

1. Start → Progress updates → Complete (100% video)

### Quiz Course Flow (mới):

1. Start → Get questions → Submit answers → Complete (if pass)

### Hybrid Course Flow (mới):

1. Start
2. Watch video → Update progress
3. Get quiz questions → Submit quiz
4. Complete (if video 100% AND quiz passed)

## 🗃️ Student Progress Updates

Progress data giờ bao gồm thêm:

```javascript
{
  progress: 0-100,
  score: 0-100,
  status: "In Progress" | "Completed" | "Failed",
  courseType: "video" | "quiz" | "hybrid",

  // Video-specific
  lastWatchedSecond: Number,

  // Quiz-specific
  quizAttempts: Number,
  quizCompleted: Boolean,
  quizResults: [{
    questionId: Number,
    isCorrect: Boolean,
    userAnswer: Number,
    correctAnswer: Number
  }],
  correctAnswers: Number,
  totalQuestions: Number,

  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F"
}
```

## 🎨 Frontend Demo

File: `public/quiz.html`

Features:

- ✅ Hiển thị câu hỏi từng câu một
- ✅ Chọn đáp án
- ✅ Progress bar
- ✅ Timer countdown (nếu có timeLimit)
- ✅ Submit và xem kết quả chi tiết
- ✅ Hiển thị explanation cho từng câu
- ✅ Màu sắc: Xanh (đúng), Đỏ (sai)

**Cách dùng:**

```
http://localhost:3001/quiz.html?courseId=quiz_react_advanced_2024
```

## 🌱 Sample Data

File: `scripts/seed-courses.js`

Tạo 3 khóa học mẫu:

1. **JavaScript Fundamentals** (video)

   - 60 phút video
   - 50 EDU

2. **React Advanced Quiz** (quiz)

   - 10 câu hỏi React nâng cao
   - Passing score: 70%
   - Time limit: 15 phút
   - 30 EDU

3. **Python Complete Course** (hybrid)
   - 75 phút video + 5 câu quiz
   - Passing score: 60%
   - Time limit: 10 phút
   - 80 EDU

**Run:**

```bash
node scripts/seed-courses.js
```

## ✨ Key Improvements

### 1. Security

- ❌ Không trả về `correctAnswer` trong GET questions
- ✅ Chỉ trả về khi submit quiz
- ✅ Server-side grading (không tin client)

### 2. Flexibility

- ✅ Passing score configurable per course
- ✅ Time limit optional
- ✅ Multiple attempts supported (có thể limit sau)

### 3. Grading System

```javascript
score >= 95: A+
score >= 90: A
score >= 85: B+
score >= 80: B
score >= 70: C
score >= 60: D
score < 60:  F (Failed)
```

### 4. Hybrid Course Logic

- Video progress tracked separately
- Quiz can be taken anytime after starting
- Completion requires BOTH:
  - Video 100% watched
  - Quiz passed (score >= passingScore)

## 🚀 Next Steps

### Frontend Integration Needed:

1. **Video Player Page**

   - Detect courseType from API
   - If hybrid: Show "Take Quiz" button after video complete

2. **Quiz Page**

   - Use `/api/quiz/:courseId/questions` to get questions
   - POST to `/api/quiz/submit` when done
   - Show results with explanations

3. **Course List**

   - Display badge: "Video" | "Quiz" | "Hybrid"
   - Show different icons per type

4. **Dashboard**
   - Show quiz score for quiz/hybrid courses
   - Video progress for video/hybrid courses

## 📝 Testing Checklist

- [ ] Create video course
- [ ] Create quiz course
- [ ] Create hybrid course
- [ ] Start video learning
- [ ] Update video progress
- [ ] Get quiz questions
- [ ] Submit quiz (pass)
- [ ] Submit quiz (fail)
- [ ] Complete video course
- [ ] Complete quiz course
- [ ] Complete hybrid course
- [ ] Verify webhook sent to EduWallet

## 🔄 Migration Notes

**Breaking Changes:**

- ❌ Không có! Tất cả courses cũ vẫn work (default courseType = 'video')

**New Required Fields:**

- Video courses: videoId, videoDuration (same as before)
- Quiz courses: quiz.questions (array with at least 1 question)
- Hybrid courses: videoId + videoDuration + quiz.questions

**Backward Compatibility:**

- ✅ Courses cũ không có courseType → mặc định là 'video'
- ✅ GET /api/courses vẫn trả về format cũ + fields mới
- ✅ Video learning flow không đổi
