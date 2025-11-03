# ✅ SETUP HOÀN TẤT - 3 PARTNER DEMO WEBSITES

## 🎯 Đã hoàn thành

### 1. Tạo 3 Partner Accounts
- ✅ Partner 1: `partner_video_001` (Video Learning Platform)
- ✅ Partner 2: `partner_quiz_002` (Quiz Learning Platform)  
- ✅ Partner 3: `partner_hybrid_003` (Hybrid Learning Platform)

### 2. Mỗi Partner có:
- ✅ Account riêng trong database
- ✅ JWT Token riêng (trong file .env)
- ✅ Khóa học riêng (2 courses mỗi partner)
- ✅ Website riêng (port 3002, 3003, 3004)

### 3. Cấu hình đã sẵn sàng:
- ✅ File .env cho cả 3 websites với JWT tokens
- ✅ Server.js có endpoint /config để frontend lấy JWT
- ✅ HTML đã được customize cho mỗi website
- ✅ Script setup-partners.js để tạo partners tự động

## 📋 Danh sách Partner & Courses

### Partner 1 - Video Learning Platform
```
Username: partner_video_001
Email: partner.video@demo.com
Password: Partner123!@#
User ID: 6902fb27137fbb370d9a8642
Port: 3002
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Courses:
1. Video Course 1 (ID: 6902fb55137fbb370d9a8657)
2. Video Course 2 (ID: 6902fb55137fbb370d9a865a)
```

### Partner 2 - Quiz Learning Platform
```
Username: partner_quiz_002
Email: partner.quiz@demo.com
Password: Partner123!@#
User ID: 6902fb28137fbb370d9a8646
Port: 3003
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Courses:
1. Quiz Course 1 (ID: 6902fb56137fbb370d9a865d)
2. Quiz Course 2 (ID: 6902fb56137fbb370d9a8660)
```

### Partner 3 - Hybrid Learning Platform
```
Username: partner_hybrid_003
Email: partner.hybrid@demo.com
Password: Partner123!@#
User ID: 6902fb28137fbb370d9a864a
Port: 3004
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Courses:
1. Hybrid Course 1 (ID: 6902fb57137fbb370d9a8663)
2. Hybrid Course 2 (ID: 6902fb57137fbb370d9a8666)
```

## 🚀 Cách khởi động

### 1. Start Backend (BẮT BUỘC)
```bash
cd backend
npm start
```
Backend phải chạy trước, nếu không websites sẽ báo lỗi "Failed to fetch"

### 2. Start Website 1 (Video)
```bash
cd partner-demos/website-1-video
node server.js
```
URL: http://localhost:3002?student=68ecef57f2d3ddc8fd99e5be

### 3. Start Website 2 (Quiz)
```bash
cd partner-demos/website-2-quiz
node server.js
```
URL: http://localhost:3003?student=68ecef57f2d3ddc8fd99e5be

### 4. Start Website 3 (Hybrid)
```bash
cd partner-demos/website-3-hybrid
node server.js
```
URL: http://localhost:3004?student=68ecef57f2d3ddc8fd99e5be

## 🔧 Vấn đề đã giải quyết

### ❌ Lỗi: 401 Unauthorized
**Nguyên nhân**: Partner API yêu cầu JWT token, không phải API key

**Giải pháp**: 
- Tạo partner accounts bằng script `setup-partners.js`
- Login để lấy JWT token
- Lưu token vào file .env
- Frontend load token từ endpoint /config
- Dùng token trong header: `Authorization: Bearer ${PARTNER_JWT_TOKEN}`

### ❌ Lỗi: Failed to fetch
**Nguyên nhân**: Backend chưa chạy

**Giải pháp**: 
- Phải start backend trước: `cd backend && npm start`
- Backend chạy trên port 3001
- Check health: `curl http://localhost:3001/health`

### ✅ 3 Databases riêng biệt
Mỗi partner có:
- User ID riêng
- Courses riêng (owner = partner user ID)
- JWT token riêng
- Cách ly dữ liệu hoàn toàn

## 📊 Kiến trúc hệ thống

```
┌─────────────────────────────────────────┐
│     EduWallet Backend (Port 3001)       │
│  - MongoDB: eduwallet database          │
│  - Collections:                         │
│    * users (3 partners)                 │
│    * partnercourses (6 courses)         │
│  - Partner API với JWT auth             │
└─────────────────────────────────────────┘
              ▲
              │ JWT Authentication
              │
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
┌───▼────┐ ┌──▼─────┐ ┌▼────────┐
│Website1│ │Website2│ │Website3 │
│Video   │ │Quiz    │ │Hybrid   │
│:3002   │ │:3003   │ │:3004    │
│        │ │        │ │         │
│Partner1│ │Partner2│ │Partner3 │
│2 courses│ │2 courses│ │2 courses│
└────────┘ └────────┘ └─────────┘
```

## 📝 Files quan trọng

### Scripts
- `setup-partners.js` - Tạo 3 partner accounts & courses
- `copy-html.js` - Copy và customize HTML cho 3 websites
- `start-all-3-websites.ps1` - PowerShell script start tất cả
- `start-all-3-websites.bat` - Batch script start tất cả

### Configuration
- `website-1-video/.env` - Config cho partner 1
- `website-2-quiz/.env` - Config cho partner 2
- `website-3-hybrid/.env` - Config cho partner 3

### Code
- `website-X/server.js` - Express server với /config endpoint
- `website-X/public/index.html` - Frontend với JWT authentication

## 🎨 Customization cho mỗi website

### Website 1 - Video 🎥
- Gradient: Purple (#667eea → #764ba2)
- Title: "Video Learning Platform"
- Icon: 🎥

### Website 2 - Quiz 📝
- Gradient: Green (#11998e → #38ef7d)
- Title: "Quiz Learning Platform"
- Icon: 📝

### Website 3 - Hybrid 🎯
- Gradient: Orange (#fc4a1a → #f7b733)
- Title: "Hybrid Learning Platform"
- Icon: 🎯

## 🧪 Testing

### Test Website 1 đã hoạt động:
```
✅ Backend running on port 3001
✅ Website 1 running on port 3002
✅ JWT token loaded from /config
✅ Courses loaded from /api/partner/courses
✅ Display 2 courses của partner 1
✅ Student ID extracted from URL
```

### Test còn lại:
- ⏳ Website 2 (port 3003) - Cần fix working directory issue
- ⏳ Website 3 (port 3004) - Cần fix working directory issue

## 🐛 Issues cần fix

### Working Directory Issue
Khi chạy `node server.js` từ terminal khác thư mục hiện tại:
```
Error: Cannot find module 'C:\Workspace\Hackathon_Pione\eduWallet\server.js'
```

**Giải pháp tạm thời**: 
```bash
# Phải cd vào thư mục trước khi chạy
cd c:\Workspace\Hackathon_Pione\eduWallet\partner-demos\website-2-quiz
node server.js
```

**Giải pháp lâu dài**: Dùng PowerShell script hoặc batch file

## 📖 Hướng dẫn sử dụng

### Cho Partner (Website owner):

1. **Tạo khóa học mới**:
   - Click nút "➕ Tạo khóa học mới"
   - Điền thông tin: title, description, link, price
   - Submit
   - Khóa học xuất hiện trong danh sách

2. **Xem khóa học**:
   - Tất cả khóa học của partner hiển thị trong grid
   - Mỗi card show: title, description, price, date
   - Click vào card để xem chi tiết

3. **Share link với student**:
   - Mỗi khóa học có URL: `http://domain.com/path?student=ID`
   - Copy URL này gửi cho student
   - Student click vào sẽ tự động enroll

### Cho Student:

1. **Nhận link từ partner**:
   ```
   http://localhost:3002/dev-appt?student=68ecef57f2d3ddc8fd99e5be
   ```

2. **Click vào link**:
   - Tự động mở website
   - Tự động extract student ID
   - Backend tự động tạo enrollment

3. **Học và hoàn thành**:
   - Xem video/làm quiz
   - Hoàn thành khóa học
   - Nhận certificate vào EduWallet

## 🎉 Kết luận

### ✅ Đã hoàn thành:
1. ✅ 3 partner accounts riêng biệt
2. ✅ 6 khóa học (2 mỗi partner)
3. ✅ JWT authentication hoạt động
4. ✅ Website 1 chạy thành công
5. ✅ Frontend load courses từ backend
6. ✅ Student ID từ URL parameter
7. ✅ Mỗi partner có data riêng

### 🚧 Cần hoàn thiện:
- ⏳ Fix working directory để start website 2 & 3
- ⏳ Test đầy đủ cả 3 websites
- ⏳ Thêm error handling tốt hơn
- ⏳ Add loading states
- ⏳ Improve UI/UX

### 🎯 Cách tiếp tục:
```bash
# 1. Đảm bảo backend đang chạy
cd backend
npm start

# 2. Mở 3 terminals riêng, mỗi terminal cd vào thư mục website
# Terminal 1:
cd c:\Workspace\Hackathon_Pione\eduWallet\partner-demos\website-1-video
node server.js

# Terminal 2:
cd c:\Workspace\Hackathon_Pione\eduWallet\partner-demos\website-2-quiz
node server.js

# Terminal 3:
cd c:\Workspace\Hackathon_Pione\eduWallet\partner-demos\website-3-hybrid
node server.js

# 3. Mở browser với 3 tabs
http://localhost:3002?student=68ecef57f2d3ddc8fd99e5be
http://localhost:3003?student=68ecef57f2d3ddc8fd99e5be
http://localhost:3004?student=68ecef57f2d3ddc8fd99e5be
```

---

**Status**: ✅ Setup hoàn tất, 1/3 websites đang chạy thành công!
