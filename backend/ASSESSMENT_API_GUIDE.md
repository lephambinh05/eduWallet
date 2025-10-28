## 📝 Assessment Management - API Documentation

### 🎯 **Hai chế độ quản lý điểm:**

#### **1. 🆕 Thêm Assessment Mới (Khuyến nghị)**
- **Endpoint**: `POST /api/enrollments/:id/assessments/add`
- **Mô tả**: Tạo assessment mới mà không sửa assessment cũ
- **Lợi ích**: Giữ lại lịch sử điểm, có thể chứa nhiều lần đánh giá

```javascript
// Request
POST /api/enrollments/6901136b250421cb3b4371a5/assessments/add
{
  "title": "Bài kiểm tra cuối kỳ",
  "score": 9
}

// Response
{
  "success": true,
  "message": "New assessment added successfully",
  "data": {
    "enrollment": { ... },
    "newAssessment": {
      "_id": "6901136b250421cb3b4371a6",
      "title": "Bài kiểm tra cuối kỳ", 
      "score": 9,
      "createdBy": "69010d91e5ba7476d42707fa",
      "createdAt": "2025-10-29T..."
    }
  }
}
```

#### **2. ✏️ Cập Nhật Assessment Cũ**
- **Endpoint**: `PUT /api/enrollments/:id/assessments/:aid`
- **Mô tả**: Sửa assessment hiện có (ghi đè)
- **Sử dụng**: Khi cần sửa lỗi điểm đã nhập

```javascript
// Request  
PUT /api/enrollments/6901136b250421cb3b4371a5/assessments/6901136b250421cb3b4371a5
{
  "title": "Bài kiểm tra giữa kỳ (đã sửa)",
  "score": 8
}

// Response
{
  "success": true,
  "message": "Assessment updated successfully", 
  "data": {
    "enrollment": { ... }
  }
}
```

### 🔍 **Cấu trúc dữ liệu Assessment:**

```javascript
// Trong enrollment.metadata.assessments[]
{
  "_id": "ObjectId",
  "title": "Tên bài đánh giá",
  "score": 8.5,           // Điểm từ 0-10
  "createdBy": "ObjectId", // ID của người tạo
  "createdAt": "Date",    // Thời gian tạo
  "updatedAt": "Date"     // Thời gian cập nhật (chỉ có khi PUT)
}
```

### 📊 **Tính điểm tự động:**

- **totalPoints**: Tổng tất cả điểm
- **progressPercent**: (Điểm trung bình / 10) * 100
- **Điểm trung bình**: Tổng điểm / Số lượng assessment

### 🎯 **Ví dụ sử dụng trong thực tế:**

```javascript
// Tạo nhiều assessment cho 1 học viên
// 1. Bài tập về nhà
POST /api/enrollments/ABC123/assessments/add
{ "title": "Bài tập JavaScript cơ bản", "score": 7 }

// 2. Kiểm tra giữa kỳ  
POST /api/enrollments/ABC123/assessments/add
{ "title": "Kiểm tra HTML/CSS", "score": 8 }

// 3. Dự án cuối kỳ
POST /api/enrollments/ABC123/assessments/add  
{ "title": "Dự án React.js", "score": 9 }

// Kết quả: 3 assessments, điểm TB = (7+8+9)/3 = 8.0, progress = 80%
```

### 🚀 **Migration cho dữ liệu cũ:**

Nếu bạn có dữ liệu assessment cũ và muốn chuyển sang hệ thống mới, bạn có thể:

1. **Giữ nguyên** assessments cũ
2. **Thêm mới** assessments bằng endpoint `POST /assessments/add`
3. **Xóa cũ** nếu cần bằng endpoint `DELETE /assessments/:aid`

### ✅ **Lợi ích của hệ thống mới:**

- 📚 **Lịch sử điểm**: Giữ tất cả lần đánh giá
- 🔄 **Linh hoạt**: Có thể thêm hoặc sửa
- 📊 **Báo cáo**: Theo dõi tiến độ học tập
- 🔐 **Bảo mật**: Chỉ seller/admin mới sửa được