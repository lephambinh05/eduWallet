# Hướng dẫn cài đặt và chạy Partner Demo Websites

## 📋 Tổng quan

Dự án bao gồm 3 website demo của đối tác tích hợp với EduWallet:

1. **Website 1 - Video Learning**: Học qua video YouTube với tracking tiến trình
2. **Website 2 - Quiz Platform**: Làm bài quiz (2 tasks × 5 câu hỏi)
3. **Website 3 - Hybrid**: Kết hợp video và quiz

## 🚀 Cài đặt nhanh

### Bước 1: Cài đặt dependencies cho tất cả websites

```powershell
# Website 1
cd partner-demos\website-1-video
npm install

# Website 2
cd ..\website-2-quiz
npm install

# Website 3
cd ..\website-3-hybrid
npm install
```

### Bước 2: Cấu hình môi trường

Mỗi website cần file `.env`. Copy từ `.env.example` và cập nhật:

```powershell
# Trong mỗi folder website
copy .env.example .env
```

Cập nhật file `.env` với thông tin thực tế:
```env
PORT=3001  # hoặc 3002, 3003 tùy theo website
PARTNER_ID=partner_xxx_xxx
PARTNER_SECRET=your_actual_secret_key
EDUWALLET_API_URL=https://api-eduwallet.mojistudio.vn
EDUWALLET_WEBHOOK_ENDPOINT=/api/webhooks/partner-updates
```

## 🎯 Chạy từng website

### Chạy Website 1 (Video)
```powershell
cd partner-demos\website-1-video
npm start
```
Mở trình duyệt: http://localhost:3001

### Chạy Website 2 (Quiz)
```powershell
cd partner-demos\website-2-quiz
npm start
```
Mở trình duyệt: http://localhost:3002

### Chạy Website 3 (Hybrid)
```powershell
cd partner-demos\website-3-hybrid
npm start
```
Mở trình duyệt: http://localhost:3003

## 🔄 Chạy tất cả cùng lúc

Tạo file `start-all-demos.bat` trong folder `partner-demos`:

```batch
@echo off
echo Starting all Partner Demo Websites...

start "Website 1 - Video" cmd /k "cd website-1-video && npm start"
timeout /t 2 /nobreak > nul

start "Website 2 - Quiz" cmd /k "cd website-2-quiz && npm start"
timeout /t 2 /nobreak > nul

start "Website 3 - Hybrid" cmd /k "cd website-3-hybrid && npm start"

echo All websites started!
echo.
echo Website 1 (Video): http://localhost:3001
echo Website 2 (Quiz):  http://localhost:3002
echo Website 3 (Hybrid): http://localhost:3003
pause
```

Chạy file này để khởi động cả 3 website cùng lúc.

## 📝 Cách sử dụng

### Website 1 - Video Learning

1. Nhập Student ID (ví dụ: `student_001`)
2. Nhập Course ID: `course_001`
3. Click "Bắt đầu học"
4. Xem video (progress tự động tính)
5. Khi xem xong, click "Hoàn thành khóa học"
6. Kết quả sẽ được gửi đến EduWallet

### Website 2 - Quiz Platform

1. Nhập Student ID (ví dụ: `student_002`)
2. Nhập Course ID: `quiz_course_001`
3. Click "Bắt đầu học"
4. Làm Task 1 (5 câu hỏi), click "Nộp bài Task này"
5. Làm Task 2 (5 câu hỏi), click "Nộp bài Task này"
6. Click "Gửi kết quả đến EduWallet"

### Website 3 - Hybrid

1. Nhập Student ID (ví dụ: `student_003`)
2. Nhập Course ID: `hybrid_course_001`
3. Click "Bắt đầu học"
4. **Task 1**: Xem video, click "Hoàn thành xem video"
5. **Task 2**: Làm quiz (5 câu hỏi), click "Nộp bài Quiz"
6. Click "Gửi kết quả đến EduWallet"

## 🔐 Tích hợp với EduWallet

### Endpoint nhận webhook

Backend EduWallet cần có endpoint:
```
POST /api/webhooks/partner-updates
```

### Headers gửi kèm

```
Content-Type: application/json
X-Partner-Id: <partner_id>
X-Partner-Timestamp: <unix_timestamp>
X-Partner-Signature: sha256=<hmac_hex>
```

### Payload mẫu

```json
{
  "partnerId": "partner_xxx",
  "eventType": "course_result",
  "studentId": "student_001",
  "courseId": "course_001",
  "course": {
    "name": "Tên khóa học",
    "description": "Mô tả",
    "issuer": "Đơn vị cấp",
    "category": "Programming",
    "level": "Beginner",
    "credits": 3,
    "skills": ["HTML", "CSS", "JavaScript"]
  },
  "results": {
    "progress": 100,
    "status": "Completed",
    "score": 95,
    "grade": "A+",
    "modulesCompleted": 1,
    "totalModules": 1,
    "issuedAt": "2025-10-30T08:00:00.000Z"
  }
}
```

### Xác thực HMAC

Server EduWallet cần verify signature:

```javascript
const crypto = require('crypto');

function verifySignature(timestamp, body, signature, secret) {
  const payload = timestamp + JSON.stringify(body);
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
  
  return signature === expectedSignature;
}
```

## 🧪 Test dữ liệu

### Website 1 - Course có sẵn
- Course ID: `course_001`
- Video: 10 phút (600 giây)
- Auto-progress mỗi 5 giây

### Website 2 - Course có sẵn
- Course ID: `quiz_course_001`
- 2 Tasks, mỗi task 5 câu hỏi
- Tính điểm tự động

### Website 3 - Course có sẵn
- Course ID: `hybrid_course_001`
- Task 1: Video 8 phút
- Task 2: Quiz 5 câu hỏi

## 🛠️ Troubleshooting

### Port đã được sử dụng

Nếu port bị chiếm, sửa trong file `.env`:
```env
PORT=3004  # hoặc port khác còn trống
```

### Không kết nối được EduWallet API

Kiểm tra:
1. `EDUWALLET_API_URL` trong `.env` có đúng không
2. Backend EduWallet có đang chạy không
3. Partner ID và Secret có đúng không

### Lỗi signature không khớp

1. Kiểm tra `PARTNER_SECRET` khớp với backend
2. Kiểm tra timestamp không quá xa (±300 giây)
3. Body JSON phải chính xác (không có trailing commas)

## 📚 Tài liệu tham khảo

- `PARTNER_API_DEMO.md`: Chi tiết về API và webhook
- `example.txt`: Yêu cầu ban đầu
- Backend route: `backend/src/routes/webhooks.js` (cần tạo)

## 💡 Mở rộng

### Thêm course mới

Sửa file `routes/api.js` trong mỗi website, thêm vào object `courses`:

```javascript
courses['new_course_id'] = {
  id: 'new_course_id',
  name: 'Tên khóa học',
  // ... thêm thông tin khác
};
```

### Thêm câu hỏi quiz

Thêm vào mảng `questions` trong task quiz:

```javascript
{
  id: 'q6',
  question: 'Câu hỏi mới?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 0  // index của đáp án đúng
}
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log trong browser (F12)
2. Terminal log của server
3. Network tab để xem request/response

## ✅ Checklist triển khai

- [ ] Cài đặt Node.js >= 14
- [ ] Cài npm packages cho cả 3 websites
- [ ] Tạo file .env từ .env.example
- [ ] Cập nhật PARTNER_ID và PARTNER_SECRET
- [ ] Backend EduWallet có endpoint webhook
- [ ] Test từng website riêng lẻ
- [ ] Test gửi dữ liệu đến EduWallet
- [ ] Verify signature ở backend
- [ ] Kiểm tra dữ liệu được lưu đúng
