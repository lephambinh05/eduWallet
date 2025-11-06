# Hướng dẫn Sử dụng Domain-Based Partner Sources

## Tổng quan

Thay vì phải nhập đầy đủ URL API, bạn CHỈ CẦN nhập **domain** của website đối tác. Hệ thống sẽ tự động:

- ✅ Tạo đầy đủ các API endpoints
- ✅ Xử lý protocol (http/https) tự động
- ✅ Chuẩn hóa domain format

## Cách sử dụng

### 1. Thêm Partner Source

**Trước đây (cũ):**

```
Tên nguồn: Website Partner 1
URL API: https://partner-website.com/api/courses
API Key: xxx-xxx-xxx
```

**Bây giờ (mới):**

```
Tên nguồn: Website Partner 1
Domain: partner-website.com
```

Chỉ vậy thôi! 🎉

### 2. Hệ thống tự động tạo

Khi bạn nhập domain `partner-website.com`, hệ thống tự động tạo:

```javascript
{
  coursesApi: "https://partner-website.com/api/courses",
  courseDetail: "https://partner-website.com/api/courses/:id",
  enrollments: "https://partner-website.com/api/enrollments"
}
```

### 3. Ví dụ thực tế

#### Ví dụ 1: Production domain

```
Input:  partner-website.com
Output: https://partner-website.com/api/courses
```

#### Ví dụ 2: Subdomain

```
Input:  api.partner.com
Output: https://api.partner.com/api/courses
```

#### Ví dụ 3: Localhost (development)

```
Input:  localhost:3001
Output: http://localhost:3001/api/courses
```

#### Ví dụ 4: IP Address

```
Input:  192.168.1.100:3000
Output: http://192.168.1.100:3000/api/courses
```

## Format Domain hợp lệ

### ✅ Chấp nhận:

```
partner.com
www.partner.com
api.partner.com
partner.com:3000
localhost:3001
192.168.1.100:3000
subdomain.example.com
```

### ✅ Tự động xử lý:

```
https://partner.com          → partner.com
http://partner.com           → partner.com
partner.com/                 → partner.com
https://partner.com/api/     → partner.com
```

### ❌ Không hợp lệ:

```
partner.com/api/courses  (quá dài, chỉ cần domain)
/api/courses             (thiếu domain)
partner                  (không phải domain hợp lệ)
```

## UI/UX Flow

### Thêm nguồn mới

```
┌─────────────────────────────────┐
│   Thêm Nguồn API Mới            │
├─────────────────────────────────┤
│                                 │
│  Tên nguồn *                    │
│  ┌─────────────────────────┐   │
│  │ Website Partner 1       │   │
│  └─────────────────────────┘   │
│                                 │
│  Domain *                       │
│  ┌─────────────────────────┐   │
│  │ partner-website.com     │   │
│  └─────────────────────────┘   │
│                                 │
│  💡 Chỉ cần nhập domain,        │
│  hệ thống sẽ tự động tạo        │
│  API endpoints                  │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │   Hủy    │  │   Thêm   │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

### Hiển thị source card

```
┌──────────────────────────────────────────┐
│  Website Partner 1                       │
│  🔗 partner-website.com                  │
│                                          │
│  [↓ Sync] [⚙️ Edit] [🗑️ Delete]        │
└──────────────────────────────────────────┘
```

## API Request/Response

### Frontend → Backend

**POST /api/partner/sources**

```json
{
  "name": "Website Partner 1",
  "domain": "partner-website.com"
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
      "domain": "partner-website.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Đã tạo nguồn API thành công"
}
```

### Backend → Partner Website

Khi sync, backend sẽ tự động build URL:

```javascript
const domain = "partner-website.com";
const protocol = domain.startsWith("localhost") ? "http" : "https";
const url = `${protocol}://${domain}/api/courses`;

// GET https://partner-website.com/api/courses
```

## Backend Implementation

### Model: PartnerSource

```javascript
{
  name: "Website Partner 1",
  domain: "partner-website.com",  // ← CHỈ LƯU DOMAIN

  // Helper methods
  getApiEndpoints() {
    return {
      courses: `https://${this.domain}/api/courses`,
      courseDetail: (id) => `https://${this.domain}/api/courses/${id}`
    }
  },

  // Virtual property
  coursesApiUrl: `https://${this.domain}/api/courses`
}
```

### Domain Cleaning

Backend tự động clean domain:

```javascript
// Input variations
"https://partner.com"      → "partner.com"
"http://partner.com/"      → "partner.com"
"partner.com/api"          → "partner.com"
"  partner.com  "          → "partner.com"
```

### Protocol Detection

```javascript
// Auto-detect protocol
const protocol =
  domain.startsWith("localhost") || domain.match(/^\d+\.\d+\.\d+\.\d+/)
    ? "http"
    : "https";
```

## Testing

### Test Case 1: Production domain

```javascript
Input: {
  name: "Production Partner",
  domain: "partner-prod.com"
}

Expected:
- coursesApiUrl: "https://partner-prod.com/api/courses"
- Sync succeeds
```

### Test Case 2: Local development

```javascript
Input: {
  name: "Local Dev",
  domain: "localhost:3001"
}

Expected:
- coursesApiUrl: "http://localhost:3001/api/courses"
- Sync succeeds
```

### Test Case 3: Domain cleaning

```javascript
Input: {
  domain: "https://example.com/"
}

Expected:
- Stored: "example.com"
- coursesApiUrl: "https://example.com/api/courses"
```

## Benefits

### ✅ User Experience

- Đơn giản hơn (chỉ 1 field thay vì 2-3)
- Ít lỗi format
- Dễ nhớ, dễ nhập
- Mobile-friendly

### ✅ Maintainability

- Dễ migrate giữa http/https
- Dễ thay đổi API structure
- Consistent format
- Auto-scaling cho multiple endpoints

### ✅ Flexibility

- Hỗ trợ localhost dev
- Hỗ trợ IP address
- Hỗ trợ subdomain
- Hỗ trợ custom ports

## Migration từ apiUrl sang domain

Nếu bạn đã có data cũ với `apiUrl`, hệ thống vẫn hoạt động:

```javascript
// Old data
{
  apiUrl: "https://partner.com/api/courses";
}

// New data
{
  domain: "partner.com";
}

// Both work! Model có backward compatibility
```

## Example Scenarios

### Scenario 1: Multiple partner websites

```javascript
// Partner A có 3 websites
[
  { name: "Partner A - Main", domain: "partnera.com" },
  { name: "Partner A - Blog", domain: "blog.partnera.com" },
  { name: "Partner A - Academy", domain: "academy.partnera.com" }
]

// Hệ thống tự tạo:
- https://partnera.com/api/courses
- https://blog.partnera.com/api/courses
- https://academy.partnera.com/api/courses
```

### Scenario 2: Development → Production

```javascript
// Development
{ domain: "localhost:3001" }
→ http://localhost:3001/api/courses

// Staging
{ domain: "staging.partner.com" }
→ https://staging.partner.com/api/courses

// Production
{ domain: "partner.com" }
→ https://partner.com/api/courses

// Chỉ cần update domain field!
```

### Scenario 3: Partner với custom infrastructure

```javascript
// API server riêng
{ domain: "api.partner.com" }
→ https://api.partner.com/api/courses

// CDN endpoint
{ domain: "cdn.partner.com" }
→ https://cdn.partner.com/api/courses

// Load balancer
{ domain: "lb.partner.com:8080" }
→ https://lb.partner.com:8080/api/courses
```

## Troubleshooting

### Domain không sync được?

**Check 1: Domain format**

```bash
# Valid
partner.com ✅
localhost:3001 ✅

# Invalid
partner ❌ (không đủ TLD)
https://partner.com/api ❌ (thừa path)
```

**Check 2: DNS resolution**

```bash
ping partner.com
# Should resolve to IP
```

**Check 3: API availability**

```bash
curl https://partner.com/api/courses
# Should return course list
```

### Không tạo được source?

**Error: "Tên và Domain là bắt buộc"**

- Cả 2 field đều required
- Không được để trống

**Error: Database error**

- Check domain không trùng với source khác của cùng partner
- Domain phải unique per partner

## Best Practices

1. **Sử dụng domain gốc**

   ```
   ✅ partner.com
   ❌ partner.com/api/v1/courses
   ```

2. **Subdomain cho API riêng**

   ```
   ✅ api.partner.com
   ✅ courses.partner.com
   ```

3. **Localhost với port**

   ```
   ✅ localhost:3001
   ✅ localhost:8080
   ```

4. **Tên nguồn rõ ràng**
   ```
   ✅ "Partner A - Main Website"
   ✅ "Partner B - Video Courses"
   ❌ "Partner 1"
   ❌ "Test"
   ```

## Future Enhancements

- [ ] Auto-detect API version (v1, v2)
- [ ] Support custom paths `/courses` vs `/api/courses`
- [ ] Domain validation với DNS check
- [ ] SSL certificate verification
- [ ] Domain health monitoring
- [ ] Auto-retry với failover domains
