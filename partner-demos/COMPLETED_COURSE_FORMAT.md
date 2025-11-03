# Partner API Payload Format - CompletedCourse

## 📋 Tổng quan

Sau khi cập nhật theo `PARTNER_API_DEMO (1).md`, các website partner demo hiện gửi dữ liệu theo format **CompletedCourse** chuẩn.

## 🔄 Thay đổi chính

### Format cũ (không còn dùng)
```json
{
  "partnerId": "...",
  "eventType": "course_result",
  "studentId": "...",
  "courseId": "...",
  "course": { ... },
  "results": { ... }
}
```

### Format mới (CompletedCourse)
```json
{
  "partnerId": "partner_xxx",
  "eventType": "course_completed",
  "studentId": "student_001",
  "courseId": "course_001",
  "enrollmentId": "enrollment_id_optional",
  "completedCourse": {
    "name": "Cơ sở dữ liệu",
    "description": "Khóa học về thiết kế và quản lý cơ sở dữ liệu",
    "issuer": "Đại học Công nghệ Thông tin",
    "issueDate": "2025-10-30T08:00:00.000Z",
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
    "certificateUrl": null,
    "imageUrl": null
  }
}
```

## 📊 Chi tiết các trường

### Trường bắt buộc
- `name` (string): Tên khóa học
- `description` (string): Mô tả khóa học
- `issuer` (string): Đơn vị cấp chứng chỉ
- `issueDate` (ISO date): Ngày cấp
- `category` (string): Danh mục (Programming, Business, Design, etc.)
- `level` (string): Cấp độ (Beginner, Intermediate, Advanced)
- `credits` (number): Số tín chỉ
- `grade` (string): Xếp loại (A+, A, B+, B, C, D)
- `score` (number): Điểm số (0-100)
- `status` (string): "Completed"
- `progress` (number): 100
- `modulesCompleted` (number): Số module đã hoàn thành
- `totalModules` (number): Tổng số module
- `skills` (array): Danh sách kỹ năng

### Trường tùy chọn
- `expiryDate` (ISO date | null): Ngày hết hạn
- `verificationUrl` (string | null): Link xác thực
- `certificateUrl` (string | null): Link chứng chỉ PDF
- `imageUrl` (string | null): Ảnh đại diện khóa học
- `enrollmentId` (string | null): ID enrollment nếu có

## 🎯 Ví dụ từ 3 websites

### Website 1 - Video Learning
```json
{
  "partnerId": "partner_video_demo_001",
  "eventType": "course_completed",
  "studentId": "student_001",
  "courseId": "course_001",
  "enrollmentId": null,
  "completedCourse": {
    "name": "Học lập trình Web cơ bản",
    "description": "Khóa học lập trình web từ cơ bản đến nâng cao",
    "issuer": "Đại học Công nghệ",
    "issueDate": "2025-10-30T10:30:00.000Z",
    "expiryDate": null,
    "category": "Programming",
    "level": "Beginner",
    "credits": 3,
    "grade": "A+",
    "score": 100,
    "status": "Completed",
    "progress": 100,
    "modulesCompleted": 1,
    "totalModules": 1,
    "skills": ["HTML", "CSS", "JavaScript", "React"],
    "verificationUrl": null,
    "certificateUrl": null,
    "imageUrl": null
  }
}
```

### Website 2 - Quiz Platform
```json
{
  "partnerId": "partner_quiz_demo_002",
  "eventType": "course_completed",
  "studentId": "student_002",
  "courseId": "quiz_course_001",
  "enrollmentId": null,
  "completedCourse": {
    "name": "Kiểm tra kiến thức JavaScript",
    "description": "Khóa học kiểm tra kiến thức JavaScript qua 2 bài quiz",
    "issuer": "Đại học Bách Khoa",
    "issueDate": "2025-10-30T10:30:00.000Z",
    "expiryDate": null,
    "category": "Programming",
    "level": "Intermediate",
    "credits": 2,
    "grade": "A",
    "score": 90,
    "status": "Completed",
    "progress": 100,
    "modulesCompleted": 2,
    "totalModules": 2,
    "skills": ["JavaScript", "ES6", "Async Programming", "DOM Manipulation"],
    "verificationUrl": null,
    "certificateUrl": null,
    "imageUrl": null
  }
}
```

### Website 3 - Hybrid (Video + Quiz)
```json
{
  "partnerId": "partner_hybrid_demo_003",
  "eventType": "course_completed",
  "studentId": "student_003",
  "courseId": "hybrid_course_001",
  "enrollmentId": null,
  "completedCourse": {
    "name": "Full Stack Web Development",
    "description": "Khóa học Full Stack từ cơ bản đến nâng cao với video và bài kiểm tra",
    "issuer": "Học viện Công nghệ",
    "issueDate": "2025-10-30T10:30:00.000Z",
    "expiryDate": null,
    "category": "Programming",
    "level": "Advanced",
    "credits": 4,
    "grade": "A+",
    "score": 95,
    "status": "Completed",
    "progress": 100,
    "modulesCompleted": 2,
    "totalModules": 2,
    "skills": ["React", "Node.js", "MongoDB", "Express", "REST API"],
    "verificationUrl": null,
    "certificateUrl": null,
    "imageUrl": null
  }
}
```

## 🔐 HMAC Signature

Signature được tạo theo quy tắc:
```javascript
const crypto = require('crypto');
const timestamp = Math.floor(Date.now() / 1000).toString();
const body = JSON.stringify(payload);
const secret = process.env.PARTNER_SECRET;
const hmac = crypto.createHmac('sha256', secret)
  .update(timestamp + body)
  .digest('hex');
const signature = `sha256=${hmac}`;
```

## 📤 Headers gửi kèm

```
Content-Type: application/json
X-Partner-Id: <partner_id>
X-Partner-Timestamp: <unix_timestamp>
X-Partner-Signature: sha256=<hex_hmac>
```

## 🔄 Backend EduWallet cần xử lý

Backend EduWallet khi nhận webhook với `eventType: "course_completed"` cần:

1. **Verify HMAC signature**
2. **Validate timestamp** (±300 giây)
3. **Tìm hoặc tạo User** từ `studentId`
4. **Tìm Enrollment** (nếu có `enrollmentId`)
5. **Tạo CompletedCourse record** với dữ liệu từ `completedCourse`
6. **Link với User** (`userId` field)
7. **Trả về response**:

```json
{
  "success": true,
  "message": "CompletedCourse created successfully",
  "data": {
    "_id": "generated_id",
    "name": "...",
    "userId": "...",
    ...completedCourseFields
  }
}
```

## 🧪 Testing

### Test với curl
```bash
TIMESTAMP=$(date +%s)
PAYLOAD='{
  "partnerId": "partner_test",
  "eventType": "course_completed",
  "studentId": "student_test",
  "courseId": "course_test",
  "completedCourse": {
    "name": "Test Course",
    "description": "Test Description",
    "issuer": "Test Issuer",
    "issueDate": "2025-10-30T10:00:00.000Z",
    "category": "Programming",
    "level": "Beginner",
    "credits": 3,
    "grade": "A",
    "score": 90,
    "status": "Completed",
    "progress": 100,
    "modulesCompleted": 1,
    "totalModules": 1,
    "skills": ["Test Skill"]
  }
}'

SECRET="your_secret_key"
SIGNATURE=$(echo -n "${TIMESTAMP}${PAYLOAD}" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')

curl -X POST "https://api-eduwallet.mojistudio.vn/api/webhooks/partner-updates" \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: partner_test" \
  -H "X-Partner-Timestamp: ${TIMESTAMP}" \
  -H "X-Partner-Signature: sha256=${SIGNATURE}" \
  -d "${PAYLOAD}"
```

## ✅ Checklist Implementation

Backend cần implement:
- [ ] Endpoint webhook nhận `eventType: "course_completed"`
- [ ] Verify HMAC signature
- [ ] Validate timestamp
- [ ] Map `studentId` → User (tạo mới nếu chưa có)
- [ ] Tạo CompletedCourse record
- [ ] Response với format chuẩn
- [ ] Error handling và logging
- [ ] Rate limiting

Partner websites đã implement:
- [x] Gửi đúng format CompletedCourse
- [x] Tính toán grade dựa trên score
- [x] Tạo HMAC signature đúng
- [x] Gửi đầy đủ headers
- [x] Handle response từ backend
