# 🎥 HƯỚNG DẪN SỬ DỤNG WEBSITE DEMO VIDEO

## 📋 Tổng quan

Website này là nền tảng học tập video tích hợp với EduWallet, cho phép học viên:
- Đăng nhập bằng mã học viên
- Xem danh sách khóa học có sẵn
- Chọn và học video từ YouTube
- Theo dõi tiến độ học tập
- Hoàn thành khóa học và nhận chứng nhận

## 🚀 Khởi động

### Cách 1: Chạy riêng website này

```bash
cd partner-demos/website-1-video
node server.js
```

Website sẽ chạy trên: **http://localhost:3002**

### Cách 2: Chạy cả 3 website cùng lúc

```bash
cd partner-demos
start-all-websites.bat
```

## 💡 Hướng dẫn sử dụng

### Bước 1: Đăng nhập

1. Mở browser và truy cập: **http://localhost:3002**
2. Nhập mã học viên (VD: `STUDENT001`, `STUDENT002`,...)
3. Click "Đăng nhập"

### Bước 2: Chọn khóa học

Sau khi đăng nhập, bạn sẽ thấy danh sách khóa học với thông tin:
- **Tên khóa học**: Tiêu đề khóa học
- **Mô tả**: Giới thiệu ngắn về khóa học
- **Level**: Mức độ (Beginner/Intermediate/Advanced)
- **Credits**: Số tín chỉ
- **Issuer**: Đơn vị phát hành
- **Price**: Giá bằng EDU token

Click vào khóa học bạn muốn học để bắt đầu.

### Bước 3: Học video

1. **Xem video**: Video YouTube sẽ tự động phát
2. **Theo dõi tiến độ**: Thanh tiến độ hiển thị % hoàn thành
3. **Kỹ năng học được**: Danh sách skills hiển thị dưới thông tin khóa học

### Bước 4: Hoàn thành khóa học

1. Xem ít nhất **80%** video
2. Click nút "Hoàn thành khóa học"
3. Hệ thống sẽ:
   - Gửi dữ liệu đến EduWallet backend
   - Cập nhật portfolio của học viên
   - Mint NFT certificate (nếu đủ điều kiện)

## 📚 Danh sách khóa học demo

Website có 3 khóa học mẫu:

### 1. Học lập trình Web cơ bản
- **Level**: Beginner
- **Credits**: 3
- **Price**: 50 EDU
- **Skills**: HTML, CSS, JavaScript, React
- **Video**: 10 phút

### 2. JavaScript nâng cao
- **Level**: Intermediate
- **Credits**: 4
- **Price**: 75 EDU
- **Skills**: JavaScript, ES6+, Async/Await, Promises
- **Video**: 15 phút

### 3. React.js từ đầu
- **Level**: Advanced
- **Credits**: 5
- **Price**: 100 EDU
- **Skills**: React, JSX, Hooks, State Management
- **Video**: 20 phút

## 🔧 Tính năng kỹ thuật

### API Endpoints sử dụng

1. **GET /api/courses** - Lấy danh sách tất cả khóa học
2. **GET /api/courses/:id** - Lấy thông tin chi tiết 1 khóa học
3. **POST /api/learning/start** - Bắt đầu học
4. **POST /api/learning/progress** - Cập nhật tiến độ (mỗi 5 giây)
5. **POST /api/learning/complete** - Hoàn thành khóa học

### Tích hợp EduWallet

Khi hoàn thành khóa học, website sẽ gửi webhook đến EduWallet với:

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
  "completedAt": "2025-01-26T10:30:00Z",
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "certificateUrl": "https://example.com/certificates/...",
  "verificationUrl": "https://example.com/verify/..."
}
```

### Bảo mật

- Sử dụng **HMAC SHA-256** để ký webhook
- Header `X-Signature` chứa chữ ký
- Header `X-Timestamp` để chống replay attack
- Header `X-Partner-ID` để xác thực partner

## 🎯 Luồng hoạt động

```
1. Login với Student ID
   ↓
2. Load danh sách courses từ /api/courses
   ↓
3. User chọn course → Call /api/learning/start
   ↓
4. Hiển thị YouTube video
   ↓
5. Mỗi 5 giây → Call /api/learning/progress
   ↓
6. User click "Hoàn thành" → Call /api/learning/complete
   ↓
7. Server gửi webhook đến EduWallet
   ↓
8. EduWallet cập nhật portfolio & mint NFT
```

## 📝 Lưu ý

1. **Backend EduWallet phải chạy**: Website cần backend tại `http://localhost:3001`
2. **Tiến độ tối thiểu**: Phải xem ít nhất 80% video mới hoàn thành được
3. **Mock data**: Hiện tại sử dụng data mẫu trong `routes/api.js`
4. **Production**: Cần thay thế mock database bằng database thật

## 🔗 File liên quan

- `public/index.html` - Frontend UI (HTML + CSS + JavaScript)
- `server.js` - Express server chính
- `routes/api.js` - API endpoints
- `.env` - Environment variables
- `package.json` - Dependencies

## 🎨 Giao diện

- **Màu chủ đạo**: Gradient tím (#667eea → #764ba2)
- **Typography**: Segoe UI font
- **Responsive**: Hỗ trợ mobile và desktop
- **Animations**: Hover effects, transitions mượt mà

## 🐛 Debug

Nếu gặp lỗi:

1. **Port đã sử dụng**:
   ```bash
   netstat -ano | findstr :3002
   taskkill /PID <PID> /F
   ```

2. **Không load được courses**:
   - Check backend đã chạy chưa
   - Check console trong DevTools

3. **Video không phát**:
   - Check YouTube video ID hợp lệ
   - Check internet connection

## 📞 Liên hệ

- Partner ID: `partner_video_demo_001`
- Port: `3002`
- EduWallet API: `http://localhost:3001`

---

✅ **Website đã sẵn sàng sử dụng!**
