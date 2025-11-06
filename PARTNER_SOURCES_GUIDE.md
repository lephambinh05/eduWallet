# Partner Source Management - Hướng dẫn sử dụng

## Tổng quan

Tính năng **Partner Sources** cho phép bạn quản lý các nguồn API từ website đối tác để tự động đồng bộ khóa học vào hệ thống EduWallet.

## Quy trình hoạt động

```
┌──────────────────┐
│  Partner Website │  ← Nguồn khóa học gốc
│   (API Endpoint) │
└────────┬─────────┘
         │ Expose API: /api/courses
         │
         ▼
┌──────────────────────┐
│  EduWallet Platform  │
│  (Partner Panel)     │
│                      │
│  1. Add Source       │  ← Thêm URL API + API Key
│  2. Sync Courses     │  ← Kéo khóa học từ API
│  3. Manage Courses   │  ← Xuất bản/Ẩn khóa học
└──────────────────────┘
```

## Frontend (Partner Panel)

### Trang quản lý: `/partner/courses`

**Chức năng:**

1. **Quản lý Partner Sources**

   - Thêm nguồn API mới
   - Chỉnh sửa thông tin nguồn
   - Xóa nguồn không dùng nữa

2. **Đồng bộ khóa học**

   - Click nút "Sync" để kéo khóa học từ API
   - Tự động tạo/cập nhật khóa học trong hệ thống

3. **Quản lý khóa học**
   - Xem danh sách khóa học đã đồng bộ
   - Xuất bản/Ẩn khóa học
   - Xem chi tiết khóa học

### Components chính

#### PartnerCourses.js

- **Location**: `src/pages/partner/PartnerCourses.js`
- **Features**:
  - Form thêm/sửa Partner Source
  - Danh sách nguồn API với action buttons
  - Grid view khóa học
  - Modal quản lý nguồn

#### API Methods (config/api.js)

```javascript
partnerAPI: {
  // Partner Sources
  getPartnerSources: () => GET /api/partner/sources
  createPartnerSource: (data) => POST /api/partner/sources
  updatePartnerSource: (id, data) => PATCH /api/partner/sources/:id
  deletePartnerSource: (id) => DELETE /api/partner/sources/:id
  syncCoursesFromSource: (id) => POST /api/partner/sources/:id/sync

  // Courses
  getMyCourses: () => GET /api/partner/courses
  toggleCoursePublish: (id, publish) => PATCH /api/partner/courses/:id/publish
}
```

## Backend API

### Models

#### PartnerSource.js

```javascript
{
  partner: ObjectId,          // ID của partner
  name: String,               // Tên nguồn (VD: "Website Partner 1")
  apiUrl: String,             // URL API endpoint
  apiKey: String,             // API Key (optional)
  isActive: Boolean,          // Trạng thái hoạt động
  lastSyncAt: Date,           // Lần sync cuối
  lastSyncStatus: String,     // success/failed/pending
  lastSyncError: String,      // Lỗi nếu có
  syncedCoursesCount: Number  // Số khóa học đã sync
}
```

#### PartnerCourse.js (Updated)

```javascript
{
  owner: ObjectId,            // Backward compatibility
  partner: ObjectId,          // Partner ID
  partnerCourseId: String,    // ID từ hệ thống partner (unique)
  title: String,
  description: String,
  link: String,               // URL gốc
  url: String,                // Alternative URL
  priceEdu: Number,           // Backward compatibility
  price: Number,              // New field
  currency: String,           // PZO, USD, etc
  duration: Number,           // Thời lượng (phút)
  level: String,              // beginner/intermediate/advanced
  category: String,
  thumbnail: String,
  published: Boolean,         // Trạng thái xuất bản
  sourceId: ObjectId          // Ref to PartnerSource
}
```

### API Endpoints

#### 1. GET /api/partner/sources

**Auth**: Required (Partner role)
**Response**:

```json
{
  "success": true,
  "data": {
    "sources": [
      {
        "_id": "...",
        "name": "Website Partner 1",
        "apiUrl": "https://partner.com/api/courses",
        "isActive": true,
        "lastSyncAt": "2024-01-01T00:00:00.000Z",
        "syncedCoursesCount": 50
      }
    ]
  }
}
```

#### 2. POST /api/partner/sources

**Auth**: Required (Partner role)
**Body**:

```json
{
  "name": "Website Partner 1",
  "apiUrl": "https://partner.com/api/courses",
  "apiKey": "optional-api-key"
}
```

#### 3. PATCH /api/partner/sources/:id

**Auth**: Required (Partner role)
**Body**:

```json
{
  "name": "Updated Name",
  "apiUrl": "https://new-url.com/api/courses",
  "isActive": false
}
```

#### 4. DELETE /api/partner/sources/:id

**Auth**: Required (Partner role)
**Response**:

```json
{
  "success": true,
  "message": "Đã xóa nguồn API"
}
```

#### 5. POST /api/partner/sources/:id/sync

**Auth**: Required (Partner role)
**Process**:

1. Fetch courses from partner API
2. Parse response (supports multiple formats)
3. Create/Update courses in database
4. Update sync statistics

**Response**:

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

## Yêu cầu API Partner Website

Partner website cần expose một API endpoint trả về danh sách khóa học theo format sau:

### Option 1: Array trực tiếp

```json
[
  {
    "id": "course-123",
    "title": "Khóa học A",
    "description": "Mô tả khóa học",
    "price": 100,
    "currency": "PZO",
    "duration": 120,
    "level": "beginner",
    "category": "programming",
    "url": "https://partner.com/courses/123",
    "thumbnail": "https://partner.com/images/thumb.jpg",
    "published": true
  }
]
```

### Option 2: Wrapped trong object

```json
{
  "courses": [
    /* array of courses */
  ]
}
```

### Option 3: Data wrapper

```json
{
  "data": [
    /* array of courses */
  ]
}
```

### Các trường bắt buộc:

- `id` hoặc `_id` hoặc `courseId`: ID duy nhất của khóa học
- `title` hoặc `name`: Tên khóa học
- `url` hoặc `link`: Link đến khóa học

### Các trường tùy chọn:

- `description`: Mô tả
- `price`: Giá (mặc định: 0)
- `currency`: Đơn vị tiền tệ (mặc định: PZO)
- `duration`: Thời lượng phút (mặc định: 0)
- `level`: Cấp độ (mặc định: beginner)
- `category`: Danh mục (mặc định: other)
- `thumbnail` hoặc `image`: Ảnh thumbnail
- `published`: Trạng thái xuất bản (mặc định: true)

## Authentication

Nếu API partner yêu cầu authentication, thêm API Key khi tạo source. Key sẽ được gửi trong header:

```
Authorization: Bearer <API_KEY>
```

## Use Cases

### Case 1: Partner có nhiều website

```
Partner A:
  ├── Website 1 (Video courses)
  ├── Website 2 (Quiz courses)
  └── Website 3 (Hybrid courses)

→ Tạo 3 Partner Sources
→ Sync riêng từng nguồn
→ Quản lý tập trung trong EduWallet
```

### Case 2: Cập nhật khóa học định kỳ

```
1. Partner cập nhật khóa học trên website
2. Vào EduWallet → Partner Courses
3. Click "Sync" button
4. Hệ thống tự động cập nhật courses mới/đã thay đổi
```

### Case 3: Kiểm soát xuất bản

```
1. Sync tất cả khóa học từ partner
2. Review từng khóa học
3. Chỉ xuất bản những khóa học chất lượng
4. Ẩn các khóa học không phù hợp
```

## Error Handling

### Lỗi khi sync:

- **Timeout**: API không phản hồi trong 30s
- **Invalid format**: Response không đúng format
- **Network error**: Không kết nối được với API
- **Auth error**: API Key không hợp lệ

Tất cả lỗi sẽ được lưu vào `lastSyncError` và hiển thị cho user.

## Best Practices

1. **Đặt tên source rõ ràng**: "Website Partner 1 - Video Courses"
2. **Test API trước**: Verify API hoạt động bằng Postman/curl
3. **Sync định kỳ**: Ví dụ mỗi ngày hoặc khi có khóa học mới
4. **Review trước khi publish**: Kiểm tra khóa học sau khi sync
5. **Backup API Key**: Lưu API key an toàn

## Troubleshooting

### Không sync được khóa học?

1. Kiểm tra URL API có đúng không
2. Test API bằng curl/Postman
3. Verify API Key nếu cần
4. Check logs: `lastSyncError` field
5. Ensure API response format đúng

### Khóa học bị duplicate?

- Mỗi khóa học cần có `partnerCourseId` duy nhất
- Hệ thống sẽ update thay vì tạo mới nếu ID trùng

### API quá chậm?

- Optimize partner API
- Giảm số lượng course trong một request
- Implement pagination

## Testing

### Test sync với mock API:

```bash
# Start mock partner API
cd partner-demos/website-1-video
npm start

# Add source in EduWallet:
Name: Test Partner
URL: http://localhost:3001/api/courses
API Key: (empty)

# Click Sync button
```

## Deployment Notes

### VPS Deployment:

1. Copy PartnerSource model: `backend/src/models/PartnerSource.js`
2. Update partner routes: `backend/src/routes/partner.js`
3. Update PartnerCourse model: `backend/src/models/PartnerCourse.js`
4. Restart backend: `pm2 restart apieduwallet`
5. Build frontend: `npm run build`
6. Deploy: Copy build files to VPS

## Future Enhancements

- [ ] Webhook để partner tự động notify khi có khóa học mới
- [ ] Scheduled sync (cron job)
- [ ] Sync history log
- [ ] Rollback nếu sync lỗi
- [ ] Batch operations (publish/unpublish nhiều courses)
- [ ] Analytics: Track sync performance
- [ ] API versioning support
