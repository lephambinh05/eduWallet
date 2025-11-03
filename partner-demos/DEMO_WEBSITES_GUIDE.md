# 🌟 DEMO WEBSITES - EDUWALLET PARTNER INTEGRATION

## 📋 Tổng quan

Hệ thống gồm **3 website demo** mô phỏng các partner tích hợp với EduWallet:

| Website | Tên | Port | Mô tả | Course ID |
|---------|-----|------|-------|-----------|
| **Website 1** | Video Learning Platform | 3002 | Học qua video YouTube | 6902f415320a9840afe6053f |
| **Website 2** | Interactive Quiz Platform | 3003 | Học qua trắc nghiệm | 6902f415320a9840afe60542 |
| **Website 3** | Hybrid Learning Platform | 3004 | Kết hợp video + quiz | 6902f415320a9840afe60545 |

## 🎯 Tính năng chung

Cả 3 website đều có:

### ✅ Chức năng cơ bản
- ✅ Đăng nhập bằng Student ID
- ✅ Hiển thị danh sách khóa học từ database
- ✅ Cho phép học viên chọn khóa học
- ✅ Theo dõi tiến độ học tập
- ✅ Hoàn thành khóa học
- ✅ Gửi webhook đến EduWallet

### 🔐 Bảo mật
- HMAC SHA-256 signature
- Timestamp để chống replay attack
- Partner ID authentication

### 🎨 Giao diện
- Modern, responsive design
- Gradient color scheme
- Smooth animations
- User-friendly navigation

## 🚀 Khởi động nhanh

### Cách 1: Chạy cả 3 website cùng lúc (Khuyến nghị)

```bash
cd partner-demos
install-dependencies.bat    # Chỉ cần chạy 1 lần
start-all-websites.bat      # Chạy cả 3 websites
```

Sau đó mở browser:
- **Website 1**: http://localhost:3002
- **Website 2**: http://localhost:3003
- **Website 3**: http://localhost:3004

### Cách 2: Chạy từng website riêng lẻ

#### Website 1 - Video Platform
```bash
cd partner-demos/website-1-video
npm install
node server.js
```

#### Website 2 - Quiz Platform
```bash
cd partner-demos/website-2-quiz
npm install
node server.js
```

#### Website 3 - Hybrid Platform
```bash
cd partner-demos/website-3-hybrid
npm install
node server.js
```

## 📚 Chi tiết từng website

### 🎥 Website 1: Video Learning Platform

**Đặc điểm**:
- Học qua video YouTube
- Tracking tiến độ xem video tự động (mỗi 5s)
- Yêu cầu xem ít nhất 80% để hoàn thành

**Khóa học mẫu**: 
- "Học lập trình Web cơ bản"
- Level: Beginner
- Credits: 3
- Price: 50 EDU

**Xem thêm**: `website-1-video/README.md`

### 📝 Website 2: Interactive Quiz Platform

**Đặc điểm**:
- Học qua câu hỏi trắc nghiệm
- Có giới hạn thời gian làm bài
- Điểm số dựa trên số câu đúng
- Phải đạt ≥ 60% để pass

**Khóa học mẫu**:
- "Lập trình JavaScript nâng cao"
- Level: Intermediate
- Credits: 4
- Price: 75 EDU

**Xem thêm**: `website-2-quiz/README.md`

### 🎯 Website 3: Hybrid Learning Platform

**Đặc điểm**:
- Kết hợp video + quiz
- Học theo module (xem video → làm quiz)
- Điểm tổng = Video (40%) + Quiz (60%)
- Trải nghiệm học tập toàn diện

**Khóa học mẫu**:
- "Full-stack Development với React & Node.js"
- Level: Advanced
- Credits: 5
- Price: 150 EDU

**Xem thêm**: `website-3-hybrid/README.md`

## 💻 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    EduWallet Backend                    │
│                  (localhost:3001)                       │
│  - Partner API (21 endpoints)                          │
│  - Webhook receiver                                     │
│  - Portfolio management                                 │
│  - NFT minting                                         │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ Webhooks (HMAC signed)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
│  Website 1     │ │  Website 2     │ │  Website 3     │
│  Video (3002)  │ │  Quiz (3003)   │ │  Hybrid (3004) │
│                │ │                │ │                │
│  - Course List │ │  - Course List │ │  - Course List │
│  - YouTube     │ │  - Quiz Engine │ │  - Video+Quiz  │
│  - Progress    │ │  - Timer       │ │  - Modules     │
└────────────────┘ └────────────────┘ └────────────────┘
```

## 🔧 Cấu hình

### Environment Variables

Mỗi website có file `.env` riêng:

```env
PORT=300X                                           # Port riêng cho mỗi website
PARTNER_ID=partner_xxx_demo_001                    # ID riêng
PARTNER_SECRET=your_secret_key_here                # Secret key cho HMAC
EDUWALLET_API_URL=http://localhost:3001           # Backend URL
EDUWALLET_WEBHOOK_ENDPOINT=/api/webhooks/partner-updates
COURSE_ID=6902f415320a9840afe6053f                # Course ID mặc định
```

### Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "axios": "^1.4.0",
  "body-parser": "^1.20.2",
  "crypto": "^1.0.1"
}
```

## 📊 Database

### Courses trong database

Sử dụng script `sync-demo-courses.js` để tạo 3 khóa học mẫu:

```bash
cd partner-demos
node sync-demo-courses.js
```

Kết quả:
```
✅ Course 1: Học lập trình Web cơ bản
   ID: 6902f415320a9840afe6053f
   
✅ Course 2: Lập trình JavaScript nâng cao
   ID: 6902f415320a9840afe60542
   
✅ Course 3: Full-stack Development với React & Node.js
   ID: 6902f415320a9840afe60545
```

## 🔄 Luồng hoạt động chung

### 1. Login Flow
```
User enters Student ID → Validate → Show Course List
```

### 2. Course Selection Flow
```
Display courses from DB → User clicks course → Call /api/learning/start
```

### 3. Learning Flow (varies by website)
```
Website 1: Watch video → Auto-track progress
Website 2: Answer quizzes → Calculate score
Website 3: Video → Quiz → Combined score
```

### 4. Completion Flow
```
User completes → Validate requirements → Send webhook to EduWallet
→ Update portfolio → Mint NFT (if eligible)
```

## 🧪 Testing

### Kiểm tra từng website

1. **Start backend** (bắt buộc):
```bash
cd backend
npm start
```

2. **Start website muốn test**:
```bash
cd partner-demos/website-X
node server.js
```

3. **Open browser**: `http://localhost:300X`

4. **Test flow**:
   - Login với Student ID: `STUDENT001`
   - Chọn khóa học từ danh sách
   - Hoàn thành khóa học
   - Check EduWallet backend logs để xem webhook

### Kiểm tra cả 3 website

1. Start backend
2. Chạy `start-all-websites.bat`
3. Mở 3 tab browser:
   - Tab 1: http://localhost:3002
   - Tab 2: http://localhost:3003
   - Tab 3: http://localhost:3004
4. Test cùng lúc

## 📝 API Endpoints (giống nhau cho cả 3)

### GET /api/courses
Lấy danh sách tất cả khóa học

**Response**:
```json
{
  "success": true,
  "courses": [...]
}
```

### GET /api/courses/:courseId
Lấy thông tin chi tiết 1 khóa học

**Response**:
```json
{
  "success": true,
  "course": {
    "id": "course_001",
    "name": "...",
    "description": "...",
    ...
  }
}
```

### POST /api/learning/start
Bắt đầu session học

**Request**:
```json
{
  "studentId": "STUDENT001",
  "courseId": "course_001"
}
```

### POST /api/learning/progress
Cập nhật tiến độ

**Request**:
```json
{
  "studentId": "STUDENT001",
  "courseId": "course_001",
  "watchedSeconds": 120  // hoặc questionsAnswered, etc.
}
```

### POST /api/learning/complete
Hoàn thành khóa học

**Request**:
```json
{
  "studentId": "STUDENT001",
  "courseId": "course_001",
  "finalScore": 95
}
```

## 🎯 Webhook Format

Khi hoàn thành khóa học, website gửi webhook đến EduWallet:

```json
{
  "userId": "STUDENT001",
  "courseId": "course_001",
  "courseTitle": "Học lập trình Web cơ bản",
  "issuerId": "partner_video_demo_001",
  "category": "Programming",
  "level": "Beginner",
  "credits": 3,
  "grade": "A",
  "score": 95,
  "completedAt": "2025-01-26T...",
  "skills": ["HTML", "CSS", "JavaScript"],
  "certificateUrl": "https://...",
  "verificationUrl": "https://..."
}
```

**Headers**:
```
Content-Type: application/json
X-Timestamp: 1706268000000
X-Signature: sha256=abc123...
X-Partner-ID: partner_video_demo_001
```

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Windows
netstat -ano | findstr :300X
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:300X | xargs kill -9
```

### Backend không chạy

Check backend logs:
```bash
cd backend
npm start
```

### Courses không load

1. Check backend đã chạy chưa
2. Check database có courses chưa:
```bash
cd backend/scripts
node check-database-courses.js
```

3. Nếu không có, sync courses:
```bash
cd partner-demos
node sync-demo-courses.js
```

### Webhook failed

1. Check backend logs
2. Check signature calculation
3. Check endpoint URL trong `.env`

## 📂 Cấu trúc thư mục

```
partner-demos/
├── install-dependencies.bat      # Install npm cho cả 3
├── start-all-websites.bat        # Start cả 3 cùng lúc
├── sync-demo-courses.js          # Sync courses vào DB
│
├── website-1-video/
│   ├── public/
│   │   └── index.html           # Frontend
│   ├── routes/
│   │   └── api.js               # API routes
│   ├── server.js                # Express server
│   ├── .env                     # Config
│   ├── package.json
│   └── README.md                # Docs riêng
│
├── website-2-quiz/
│   ├── (structure tương tự)
│   └── README.md
│
└── website-3-hybrid/
    ├── (structure tương tự)
    └── README.md
```

## 🎓 Use Cases

### Giáo viên/Nhà trường
- Tạo khóa học mới
- Theo dõi tiến độ học viên
- Phát hành chứng chỉ NFT

### Học viên
- Browse khóa học
- Học theo cách phù hợp (video/quiz/hybrid)
- Nhận chứng chỉ vào EduWallet
- Tích lũy portfolio

### Partner/Tổ chức đào tạo
- Tích hợp nhanh chóng
- Tự động hóa phát chứng chỉ
- Track dữ liệu học tập

## 📞 Liên hệ & Hỗ trợ

- **Website 1 Partner ID**: `partner_video_demo_001`
- **Website 2 Partner ID**: `partner_quiz_demo_002`
- **Website 3 Partner ID**: `partner_hybrid_demo_003`

## 🎉 Kết luận

Hệ thống demo này cung cấp:
- ✅ 3 mô hình học tập khác nhau
- ✅ Tích hợp hoàn chỉnh với EduWallet
- ✅ UI/UX hiện đại, dễ sử dụng
- ✅ Code rõ ràng, dễ customize
- ✅ Bảo mật với HMAC signature
- ✅ Ready để mở rộng

---

**🚀 Sẵn sàng để demo!**

Chạy `start-all-websites.bat` và trải nghiệm ngay!
