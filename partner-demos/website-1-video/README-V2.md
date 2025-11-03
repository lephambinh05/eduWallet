# 🎯 HƯỚNG DẪN WEBSITE DEMO MỚI - PARTNER VIDEO PLATFORM

## 📋 Thay đổi chính

### ❌ Loại bỏ
- **KHÔNG CÓ đăng nhập** - Bỏ login section hoàn toàn

### ✅ Tính năng mới

1. **GET /api/partner/courses** - Lấy danh sách khóa học từ EduWallet backend
2. **POST /api/partner/courses** - Tạo khóa học mới
3. **URL với student parameter**: `partner.example.com/dev-appt?student=68ecef57f2d3ddc8fd99e5be`

## 🔗 URL Format

```
http://partner.example.com/dev-appt?student=68ecef57f2d3ddc8fd99e5be
                          ┌────────┘         └──────────────────────┘
                          │                            │
                   Đường dẫn khóa học          ID người dùng đăng ký
```

**Giải thích**:
- `partner.example.com`: Domain của partner
- `dev-appt`: Đường dẫn tới khóa học (được lưu trong database)
- `?student=68ecef57f2d3ddc8fd99e5be`: Tham số ID người dùng
  - Tự động tạo liên kết giữa khóa học và người dùng
  - Backend sẽ tự động enroll user vào course

## 🚀 Khởi động

### 1. Start Backend (bắt buộc)

```bash
cd backend
npm start
```

Backend chạy tại: `http://localhost:3001`

### 2. Start Website

```bash
cd partner-demos/website-1-video
node server.js
```

Website chạy tại: `http://localhost:3002`

### 3. Truy cập với Student ID

Mở browser:
```
http://localhost:3002?student=68ecef57f2d3ddc8fd99e5be
```

Hoặc không có student ID:
```
http://localhost:3002
```

## 📚 Tính năng

### 1. Xem danh sách khóa học

Khi vào trang, website tự động:
- Gọi `GET /api/partner/courses` để lấy danh sách
- Hiển thị các khóa học dạng grid
- Mỗi card hiển thị:
  - Tiêu đề
  - Mô tả
  - Giá (EDU)
  - Ngày tạo
  - Link đầy đủ (có student ID nếu có)

### 2. Tạo khóa học mới

Click nút **"➕ Tạo khóa học mới"**:

**Form nhập**:
- **Tiêu đề khóa học** (bắt buộc): VD "Học lập trình Web cơ bản"
- **Mô tả**: Mô tả chi tiết về khóa học
- **Đường dẫn khóa học** (bắt buộc): VD "dev-appt"
- **Giá (EDU)** (bắt buộc): VD "50"

**Khi submit**:
```javascript
POST /api/partner/courses
{
  "title": "Học lập trình Web cơ bản",
  "description": "Khóa học từ cơ bản đến nâng cao",
  "link": "dev-appt",
  "priceEdu": 50
}
```

**Response**:
```json
{
  "success": true,
  "message": "Course created",
  "data": {
    "course": {
      "_id": "...",
      "owner": "...",
      "title": "Học lập trình Web cơ bản",
      "description": "Khóa học từ cơ bản đến nâng cao",
      "link": "dev-appt",
      "priceEdu": 50,
      "createdAt": "2025-01-26T..."
    }
  }
}
```

### 3. Xem chi tiết khóa học

Click vào khóa học để xem:
- Thông tin đầy đủ
- URL hoàn chỉnh với student ID
- Link có thể click để mở trong tab mới

## 🔧 Cấu hình

### Environment Variables (`.env`)

```env
PORT=3002
PARTNER_ID=partner_video_demo_001
PARTNER_SECRET=your_secret_key_here
EDUWALLET_API_URL=http://localhost:3001
```

### JavaScript Config (trong HTML)

```javascript
const BACKEND_URL = 'http://localhost:3001';
const PARTNER_API_KEY = 'partner_video_demo_001'; // Replace with actual API key
```

## 📊 API Integration

### GET /api/partner/courses

**Request**:
```http
GET http://localhost:3001/api/partner/courses
Authorization: Bearer partner_video_demo_001
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "67963e15c07a39c8a33d4f01",
        "owner": "...",
        "title": "Học lập trình Web cơ bản",
        "description": "Khóa học từ cơ bản đến nâng cao",
        "link": "dev-appt",
        "priceEdu": 50,
        "createdAt": "2025-01-26T10:30:00.000Z"
      }
    ]
  }
}
```

### POST /api/partner/courses

**Request**:
```http
POST http://localhost:3001/api/partner/courses
Authorization: Bearer partner_video_demo_001
Content-Type: application/json

{
  "title": "Học lập trình Web cơ bản",
  "description": "Khóa học từ cơ bản đến nâng cao",
  "link": "dev-appt",
  "priceEdu": 50
}
```

**Response**:
```json
{
  "success": true,
  "message": "Course created",
  "data": {
    "course": { ... }
  }
}
```

## 🎯 Luồng hoạt động

### 1. User truy cập website

```
User opens: http://localhost:3002?student=68ecef57f2d3ddc8fd99e5be
           ↓
Website extracts student ID from URL parameter
           ↓
Call GET /api/partner/courses
           ↓
Display course list
```

### 2. Partner tạo khóa học mới

```
Partner clicks "Tạo khóa học mới"
           ↓
Fill form (title, description, link, price)
           ↓
Submit → Call POST /api/partner/courses
           ↓
Backend saves to database
           ↓
Reload course list
```

### 3. User chọn khóa học

```
User clicks on course card
           ↓
Display course details
           ↓
Show full URL: domain.com/dev-appt?student=ID
           ↓
User can click to enroll
```

### 4. Backend auto-enroll (khi user click URL)

```
User clicks: http://partner.com/dev-appt?student=ID
           ↓
Backend receives request with student parameter
           ↓
Automatically create enrollment record
           ↓
Link course ID with user ID
```

## 🔐 Authentication

Website sử dụng **Partner API Key** để authenticate với backend:

```javascript
headers: {
  'Authorization': `Bearer ${PARTNER_API_KEY}`,
  'Content-Type': 'application/json'
}
```

**Lưu ý**: 
- API Key phải được config trong backend
- Mỗi partner có API Key riêng
- Không expose API Key trong production

## 📝 Ví dụ sử dụng

### Scenario 1: Partner tạo khóa học

1. Mở http://localhost:3002
2. Click "Tạo khóa học mới"
3. Nhập:
   - Tiêu đề: "JavaScript nâng cao"
   - Mô tả: "Học ES6+, Async/Await, Promises"
   - Link: "js-advanced"
   - Giá: 75 EDU
4. Submit
5. Khóa học mới xuất hiện trong danh sách

### Scenario 2: Student đăng ký học

1. Student nhận link: `http://localhost:3002/js-advanced?student=68ecef57f2d3ddc8fd99e5be`
2. Click vào link
3. Backend tự động:
   - Xác định khóa học: `js-advanced`
   - Xác định student: `68ecef57f2d3ddc8fd99e5be`
   - Tạo enrollment record
   - Link course với student

## 🐛 Troubleshooting

### Lỗi: "Chưa có khóa học nào"

**Nguyên nhân**:
- Backend chưa chạy
- Chưa có khóa học trong database
- API key không đúng

**Giải pháp**:
1. Check backend đã chạy: `http://localhost:3001`
2. Check console để xem error
3. Tạo khóa học mới bằng form

### Lỗi: "Lỗi tải khóa học"

**Nguyên nhân**:
- Không kết nối được backend
- CORS issue
- Authentication failed

**Giải pháp**:
1. Check backend logs
2. Check network tab trong DevTools
3. Verify API key trong code

### Lỗi: "Lỗi tạo khóa học"

**Nguyên nhân**:
- Thiếu required fields
- Authorization failed
- Database error

**Giải pháp**:
1. Check form đã điền đầy đủ
2. Check API key hợp lệ
3. Check backend logs

## 📂 File structure

```
website-1-video/
├── public/
│   ├── index.html          # File cũ (có login)
│   ├── index-v2.html       # File mới (không login, dùng Partner API)
│   └── index-old.html      # Backup
├── routes/
│   ├── api.js              # Local API (mock data)
│   └── api-updated.js      # Updated local API
├── server.js               # Express server
├── .env                    # Environment variables
├── package.json
└── README.md               # Docs cũ
```

## 🎨 UI Components

### Course Card
- Hover effect với shadow
- Click để xem chi tiết
- Hiển thị price badge nổi bật
- Link URL có thể click

### Create Course Modal
- Centered modal
- Form validation
- Clear button states
- Responsive design

### Messages
- Success messages (green)
- Error messages (red)
- Auto-hide sau 5 giây

## 🚀 Next Steps

### Để sử dụng file mới:

```bash
# Backup file cũ
cd partner-demos/website-1-video/public
mv index.html index-backup.html

# Use new file
mv index-v2.html index.html

# Restart server
cd ..
node server.js
```

### Production checklist:

- [ ] Thay `PARTNER_API_KEY` bằng key thật
- [ ] Cấu hình domain thật thay vì localhost
- [ ] Enable HTTPS
- [ ] Setup CORS properly
- [ ] Add input validation
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Test với real student IDs

## 📞 Support

- Partner ID: `partner_video_demo_001`
- Port: `3002`
- Backend: `http://localhost:3001`
- API Docs: `PARTNER_API_DOCUMENTATION.md`

---

✅ **Website mới đã sẵn sàng!**

Không cần login, chỉ cần URL với student parameter là có thể bắt đầu học!
