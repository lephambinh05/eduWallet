# Partner Sources Management - Hướng dẫn Sử dụng

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Tính năng](#tính-năng)
3. [Cách sử dụng](#cách-sử-dụng)
4. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
5. [API Documentation](#api-documentation)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới thiệu

**Partner Sources Management** là tính năng cho phép Partner quản lý và đồng bộ khóa học từ các website đối tác vào hệ thống EduWallet một cách tự động.

### Vấn đề giải quyết

- Partner có nhiều website cung cấp khóa học
- Cần tập trung quản lý tất cả khóa học ở một nơi
- Tự động cập nhật khóa học mới từ các nguồn
- Không cần nhập thủ công từng khóa học

### Giải pháp

✅ **Chỉ cần nhập domain** của website đối tác
✅ **Hệ thống tự động** tạo API endpoints
✅ **Một click sync** để kéo toàn bộ khóa học
✅ **Quản lý tập trung** tất cả khóa học từ nhiều nguồn

---

## ✨ Tính năng

### 1. Quản lý Partner Sources (Nguồn đối tác)

```
┌─────────────────────────────────────────────┐
│  📋 Nguồn API Đối tác                       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Website Partner 1                    │  │
│  │ 🔗 partner1.com                      │  │
│  │ [↓ Sync] [⚙️] [🗑️]                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Website Partner 2                    │  │
│  │ 🔗 partner2.com                      │  │
│  │ [↓ Sync] [⚙️] [🗑️]                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  [+ Thêm Nguồn API]                         │
└─────────────────────────────────────────────┘
```

**Chức năng:**

- ➕ Thêm nguồn API mới
- ✏️ Chỉnh sửa thông tin nguồn
- 🗑️ Xóa nguồn không dùng
- 🔄 Đồng bộ khóa học từ nguồn

### 2. Đồng bộ Khóa học (Auto Sync)

```
User action: Click nút "Sync"
      ↓
Backend fetch: GET https://partner.com/api/courses
      ↓
Parse response: JSON array of courses
      ↓
Create/Update: PartnerCourse documents
      ↓
Update stats: syncedCoursesCount, lastSyncAt
      ↓
Show result: "Đã đồng bộ 50 khóa học thành công"
```

**Tự động xử lý:**

- ✅ Tạo khóa học mới nếu chưa tồn tại
- ✅ Cập nhật khóa học đã có (theo partnerCourseId)
- ✅ Parse nhiều format JSON response
- ✅ Error handling và logging

### 3. Quản lý Khóa học

```
┌─────────────────────────────────────────────┐
│  🎓 Danh sách Khóa học (150)                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Khóa học A   │  │ Khóa học B   │       │
│  │ $100 PZO     │  │ $150 PZO     │       │
│  │ [Đã xuất bản]│  │ [Nháp]       │       │
│  │ [👁️] [✓]     │  │ [👁️] [✓]     │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

**Chức năng:**

- 👁️ Xem chi tiết khóa học
- ✅ Xuất bản/Ẩn khóa học
- 📊 Hiển thị trạng thái

---

## 🚀 Cách sử dụng

### Bước 1: Truy cập trang quản lý

```
URL: https://eduwallet.mojistudio.vn/partner/courses
Hoặc: http://localhost:3000/partner/courses (dev)
```

**Yêu cầu:** Đăng nhập với tài khoản Partner

### Bước 2: Thêm nguồn API

1. Click nút **"Thêm Nguồn API"**
2. Điền thông tin:
   ```
   Tên nguồn: Website Partner 1
   Domain:    partner-website.com
   ```
3. Click **"Thêm"**

### Bước 3: Đồng bộ khóa học

1. Tìm nguồn vừa thêm trong danh sách
2. Click nút **"↓ Sync"** (icon download)
3. Đợi hệ thống xử lý (10-30 giây)
4. Xem kết quả: "Đã đồng bộ X khóa học thành công"

### Bước 4: Quản lý khóa học

1. Scroll xuống phần **"Danh sách Khóa học"**
2. Xem tất cả khóa học đã sync
3. Click icon **✓/✗** để xuất bản/ẩn khóa học
4. Click icon **👁️** để xem chi tiết

---

## 🏗️ Kiến trúc hệ thống

### Tổng quan

```
┌─────────────────────┐
│  Partner Website    │  ← Website đối tác
│  (Source of Truth)  │
└──────────┬──────────┘
           │ API: GET /api/courses
           │
           ▼
┌─────────────────────┐
│  EduWallet Backend  │  ← Sync engine
│  (Partner Routes)   │
└──────────┬──────────┘
           │ Store to MongoDB
           │
           ▼
┌─────────────────────┐
│  EduWallet Frontend │  ← Partner Panel
│  (React UI)         │
└─────────────────────┘
```

### Domain-Based Architecture

**Concept:** Chỉ cần domain, hệ thống tự tạo API URLs

```javascript
// Input
domain: "partner.com"

// System generates
{
  courses:      "https://partner.com/api/courses",
  courseDetail: "https://partner.com/api/courses/:id",
  enrollments:  "https://partner.com/api/enrollments"
}
```

**Benefits:**

- Đơn giản: 1 field thay vì 3 fields
- Flexible: Dễ đổi protocol (http ↔ https)
- Consistent: Chuẩn hóa API structure
- Smart: Auto-detect localhost → http

### Data Flow

#### 1. Thêm Source

```
Frontend                Backend              Database
   │                       │                    │
   ├─ POST /sources ──────>│                    │
   │  {domain: "..."}      │                    │
   │                       ├─ Create ───────────>│
   │                       │                    │
   │<────── 201 ──────────┤                    │
   │  {source: {...}}     │                    │
```

#### 2. Sync Courses

```
Frontend                Backend              Partner API      Database
   │                       │                      │             │
   ├─ POST /sync ─────────>│                      │             │
   │                       ├─ GET /api/courses ──>│             │
   │                       │<───── 200 ───────────┤             │
   │                       │  [{courses}]         │             │
   │                       │                      │             │
   │                       ├─ Parse & Validate   │             │
   │                       ├─ Create/Update ─────────────────────>│
   │                       │                      │             │
   │<────── 200 ──────────┤                      │             │
   │  {synced: 50}        │                      │             │
```

### Database Schema

#### PartnerSource Model

```javascript
{
  _id: ObjectId,
  partner: ObjectId,              // Ref to User
  name: "Website Partner 1",
  domain: "partner.com",          // ← Main field
  isActive: true,

  // Sync tracking
  lastSyncAt: Date,
  lastSyncStatus: "success|failed|pending",
  lastSyncError: String,
  syncedCoursesCount: 50,

  // Virtual methods
  coursesApiUrl: "https://partner.com/api/courses",
  getApiEndpoints() { ... }
}
```

#### PartnerCourse Model

```javascript
{
  _id: ObjectId,
  partner: ObjectId,              // Ref to User
  partnerCourseId: "course-123",  // Unique ID from partner

  // Course info
  title: "Khóa học A",
  description: "...",
  price: 100,
  currency: "PZO",
  duration: 120,
  level: "beginner",
  category: "programming",
  url: "https://partner.com/courses/123",
  thumbnail: "https://...",

  // Status
  published: true,

  // Tracking
  sourceId: ObjectId,             // Ref to PartnerSource
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📡 API Documentation

### Frontend API Methods

**Location:** `src/config/api.js`

```javascript
partnerAPI: {
  // Partner Sources
  getPartnerSources: () =>
    GET /api/partner/sources

  createPartnerSource: (data) =>
    POST /api/partner/sources
    Body: { name, domain }

  updatePartnerSource: (id, data) =>
    PATCH /api/partner/sources/:id
    Body: { name?, domain?, isActive? }

  deletePartnerSource: (id) =>
    DELETE /api/partner/sources/:id

  syncCoursesFromSource: (id) =>
    POST /api/partner/sources/:id/sync

  // Courses
  getMyCourses: () =>
    GET /api/partner/courses

  toggleCoursePublish: (id, publish) =>
    PATCH /api/partner/courses/:id/publish
    Body: { publish: true/false }
}
```

### Backend Endpoints

#### 1. GET /api/partner/sources

**Auth:** Required (Partner role)

**Response:**

```json
{
  "success": true,
  "data": {
    "sources": [
      {
        "_id": "...",
        "name": "Website Partner 1",
        "domain": "partner.com",
        "isActive": true,
        "lastSyncAt": "2024-01-01T00:00:00.000Z",
        "syncedCoursesCount": 50
      }
    ]
  }
}
```

#### 2. POST /api/partner/sources

**Auth:** Required (Partner role)

**Request:**

```json
{
  "name": "Website Partner 1",
  "domain": "partner.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "source": {
      "_id": "...",
      "partner": "...",
      "name": "Website Partner 1",
      "domain": "partner.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Đã tạo nguồn API thành công"
}
```

#### 3. POST /api/partner/sources/:id/sync

**Auth:** Required (Partner role)

**Process:**

1. Validate source exists and active
2. Build API URL: `https://{domain}/api/courses`
3. Fetch courses from partner API
4. Parse response (multiple formats supported)
5. Create/Update courses in database
6. Update sync statistics

**Response:**

```json
{
  "success": true,
  "message": "Đã đồng bộ 50 khóa học thành công",
  "data": {
    "synced": 50,
    "total": 50
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Cannot connect to partner API",
  "error": "ECONNREFUSED"
}
```

### Partner API Requirements

Partner website cần expose endpoint trả về danh sách khóa học:

**Endpoint:** `GET https://{domain}/api/courses`

**Response Format (Option 1 - Array):**

```json
[
  {
    "id": "course-123",
    "title": "Khóa học A",
    "description": "Mô tả",
    "price": 100,
    "currency": "PZO",
    "duration": 120,
    "level": "beginner",
    "category": "programming",
    "url": "https://partner.com/courses/123",
    "thumbnail": "https://...",
    "published": true
  }
]
```

**Response Format (Option 2 - Wrapped):**

```json
{
  "courses": [
    /* array of courses */
  ]
}
```

**Response Format (Option 3 - Data wrapper):**

```json
{
  "data": [
    /* array of courses */
  ]
}
```

**Required Fields:**

- `id` hoặc `_id` hoặc `courseId`
- `title` hoặc `name`
- `url` hoặc `link`

**Optional Fields:**

- `description`, `price`, `currency`
- `duration`, `level`, `category`
- `thumbnail` hoặc `image`
- `published`

---

## 🚢 Deployment

### Frontend Deployment

1. **Build production:**

```bash
cd f:\eduWallet
npm run build
```

2. **Deploy files:**

```bash
# Copy to VPS
scp -r build/* user@vps:/var/www/eduwallet/
```

3. **Verify:**

```
https://eduwallet.mojistudio.vn/partner/courses
```

### Backend Deployment

1. **Copy files to VPS:**

```bash
# Models
scp backend/src/models/PartnerSource.js user@vps:/www/wwwroot/api-eduwallet.mojistudio.vn/src/models/

# Routes (updated partner.js)
scp backend/src/routes/partner.js user@vps:/www/wwwroot/api-eduwallet.mojistudio.vn/src/routes/

# Updated PartnerCourse model
scp backend/src/models/PartnerCourse.js user@vps:/www/wwwroot/api-eduwallet.mojistudio.vn/src/models/
```

2. **Restart backend:**

```bash
ssh user@vps
pm2 restart apieduwallet
pm2 logs apieduwallet --lines 50
```

3. **Verify:**

```bash
curl -H "Authorization: Bearer <token>" \
  https://api-eduwallet.mojistudio.vn/api/partner/sources
```

### Environment Variables

Không cần thêm biến môi trường mới! Tính năng hoạt động với config hiện tại.

---

## 🔧 Troubleshooting

### Vấn đề 1: Không tạo được source

**Triệu chứng:**

```
Error: "Tên và Domain là bắt buộc"
```

**Giải pháp:**

- Kiểm tra cả 2 field đã điền đầy đủ
- Domain không được chứa `http://` hay `https://`
- Domain hợp lệ: `partner.com`, không phải `partner`

### Vấn đề 2: Sync thất bại

**Triệu chứng:**

```
Error: "Cannot connect to partner API"
```

**Giải pháp:**

1. **Check domain:**

```bash
ping partner.com
```

2. **Check API endpoint:**

```bash
curl https://partner.com/api/courses
```

3. **Check API response format:**

```bash
curl https://partner.com/api/courses | jq
# Phải trả về array hoặc {courses: [...]} hoặc {data: [...]}
```

4. **Check logs:**

```bash
# Frontend
Browser Console → Network tab

# Backend
pm2 logs apieduwallet
```

### Vấn đề 3: Khóa học bị duplicate

**Triệu chứng:**

- Mỗi lần sync tạo courses mới thay vì update

**Giải pháp:**

- Partner API phải trả về `id` field unique cho mỗi course
- System sẽ dùng `partnerCourseId` để tìm và update
- Nếu không có ID, mỗi lần sync sẽ tạo mới

**Fix:**

```javascript
// Partner API response
{
  "id": "course-123",  // ← Bắt buộc và phải unique
  "title": "..."
}
```

### Vấn đề 4: Khóa học không hiển thị

**Check list:**

1. ✓ Course đã được sync? (Check syncedCoursesCount)
2. ✓ Course có `published: true`?
3. ✓ Refresh trang đã chưa?
4. ✓ Check database:

```javascript
db.partner_courses.find({ partner: ObjectId("...") });
```

### Vấn đề 5: Localhost không sync được

**Triệu chứng:**

```
Error: "ECONNREFUSED"
```

**Giải pháp:**

- Ensure partner demo running:

```bash
cd partner-demos/website-1-video
npm start
# Should run on port 3001
```

- Domain phải là: `localhost:3001`
- System sẽ tự dùng `http://` cho localhost

---

## 📚 Related Documentation

- **[PARTNER_SOURCES_GUIDE.md](./PARTNER_SOURCES_GUIDE.md)** - Chi tiết technical implementation
- **[DOMAIN_BASED_SOURCES.md](./DOMAIN_BASED_SOURCES.md)** - Domain-based architecture
- **Backend README** - API authentication & authorization
- **Frontend README** - React components structure

---

## 🎓 Examples & Use Cases

### Use Case 1: Partner có nhiều website

```javascript
// Scenario
Partner A có 3 websites:
- Main:    partner.com
- Blog:    blog.partner.com
- Academy: academy.partner.com

// Solution
Tạo 3 sources:
[
  { name: "Main Website", domain: "partner.com" },
  { name: "Blog Courses", domain: "blog.partner.com" },
  { name: "Academy", domain: "academy.partner.com" }
]

// Result
150 courses từ 3 nguồn, quản lý tập trung
```

### Use Case 2: Development → Production

```javascript
// Development
domain: "localhost:3001"
→ http://localhost:3001/api/courses

// Staging
domain: "staging.partner.com"
→ https://staging.partner.com/api/courses

// Production
domain: "partner.com"
→ https://partner.com/api/courses

// Migration: Chỉ cần update domain field!
```

### Use Case 3: Cập nhật khóa học định kỳ

```javascript
// Partner thêm 10 khóa học mới trên website

// EduWallet Partner:
1. Vào /partner/courses
2. Click nút "Sync"
3. System tự động:
   - Phát hiện 10 courses mới
   - Thêm vào database
   - Update syncedCoursesCount: 50 → 60

// No manual work needed! 🎉
```

---

## 🛠️ Technical Stack

### Frontend

- **React** 18.x
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** - Database
- **Axios** - HTTP client (for fetching partner APIs)
- **JWT** - Authentication
- **Helmet** - Security headers

---

## 📄 License

Proprietary - EduWallet Platform © 2024-2025

---

## 👥 Support

**Issues?**

- Check [Troubleshooting](#troubleshooting)
- Review [API Documentation](#api-documentation)
- Contact: lephambinh05@gmail.com

**Feature Requests?**

- Create issue in repository
- Email with detailed requirements

---

## 🔄 Version History

### v1.0.0 (2025-01-06)

- ✅ Initial release
- ✅ Domain-based source management
- ✅ Auto-sync functionality
- ✅ Course management UI
- ✅ Error handling & logging

### Upcoming Features

- [ ] Scheduled auto-sync (cron jobs)
- [ ] Webhook support (partner notify EduWallet)
- [ ] Sync history log
- [ ] Batch operations (bulk publish/unpublish)
- [ ] Advanced filtering & search
- [ ] Analytics dashboard

---

**Last Updated:** January 6, 2025
**Maintained by:** EduWallet Development Team
