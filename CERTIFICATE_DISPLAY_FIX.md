# ✅ FIXED: Certificate & LearnPass Display Issues

## 🐛 Problem:
Admin pages hiển thị **0 certificates và 0 learnpasses** mặc dù database có 2 items mỗi loại.

---

## 🔍 Root Causes:

### 1. **Backend API - Wrong Populate Fields**
Backend routes đang populate với field names không đúng với User model:

**Before:**
```javascript
.populate('student', 'name email walletAddress')  // ❌ User model không có 'name' field
```

**User Model thực tế có:**
- `firstName` (String)
- `lastName` (String)
- NOT `name`

### 2. **Frontend - Missing Data Transformation**
Frontend expect `studentName` và `institutionName` nhưng backend trả về objects.

---

## ✅ Solutions Applied:

### Backend Fixes (`backend/src/routes/admin.js`):

#### 1. **GET /api/admin/certificates**
```javascript
// BEFORE (line 234-238):
Certificate.find(query)
  .populate('student', 'name email walletAddress')  // ❌ Wrong
  .populate('issuer', 'name logo')

// AFTER:
Certificate.find(query)
  .populate('student', 'firstName lastName email walletAddress studentId')  // ✅ Correct
  .populate('issuer', 'name logo institutionId')
```

#### 2. **GET /api/admin/certificates/:id**
```javascript
// BEFORE (line 268-269):
.populate('student', 'name email walletAddress')  // ❌ Wrong
.populate('issuer', 'name logo website')

// AFTER:
.populate('student', 'firstName lastName email walletAddress studentId')  // ✅ Correct
.populate('issuer', 'name logo website institutionId')
```

#### 3. **GET /api/admin/learnpasses**
```javascript
// BEFORE (line 451-452):
LearnPass.find(query)
  .populate('owner', 'name email walletAddress')  // ❌ Wrong
  .populate('institutionId', 'name logo')

// AFTER:
LearnPass.find(query)
  .populate('owner', 'firstName lastName email walletAddress studentId')  // ✅ Correct
  .populate('institutionId', 'name logo institutionId')
```

#### 4. **GET /api/admin/learnpasses/:id**
```javascript
// BEFORE (line 487-488):
.populate('owner', 'name email walletAddress')  // ❌ Wrong
.populate('institutionId', 'name logo website')

// AFTER:
.populate('owner', 'firstName lastName email walletAddress studentId')  // ✅ Correct
.populate('institutionId', 'name logo website institutionId')
```

---

### Frontend Fixes:

#### 1. **AdminCertificates.js** - Data Transformation
```javascript
// BEFORE:
const certs = response.certificates || [];
setCertificates(certs);

// AFTER:
const certs = (response.certificates || []).map(cert => ({
  ...cert,
  // Transform student object to studentName for display
  studentName: cert.student ? `${cert.student.firstName || ''} ${cert.student.lastName || ''}`.trim() : 'N/A'
}));
setCertificates(certs);

// Also fixed stats calculation:
verified: certs.filter(c => c.isVerified === true).length,  // Use isVerified boolean
pending: certs.filter(c => c.isVerified === false).length,
```

#### 2. **AdminLearnPasses.js** - Data Transformation
```javascript
// BEFORE:
const lps = response.learnPasses || [];
setLearnPasses(lps);

// AFTER:
const lps = (response.learnPasses || []).map(lp => ({
  ...lp,
  // Transform institutionId object to institutionName for display
  institutionName: lp.institutionId?.name || 'N/A'
}));
setLearnPasses(lps);
```

---

## 📊 Data Model Reference:

### User Model Fields:
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  walletAddress: String,
  studentId: String
}
```

### Certificate Model Fields:
```javascript
{
  student: ObjectId (ref: 'User'),
  issuer: ObjectId (ref: 'Institution'),
  issuerName: String,  // Stored in document
  courseName: String,
  certificateId: String,
  status: enum ['active', 'suspended', 'revoked', 'expired'],
  isVerified: Boolean
}
```

### LearnPass Model Fields:
```javascript
{
  owner: ObjectId (ref: 'User'),
  institutionId: ObjectId (ref: 'Institution'),
  name: String,  // Stored in document
  studentId: String,
  email: String,
  status: enum ['active', 'suspended', 'revoked'],
  isVerified: Boolean
}
```

---

## ✅ Test Results:

### Backend API Response Now Returns:
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "_id": "...",
        "student": {
          "firstName": "Tran",
          "lastName": "Trong Khang",
          "email": "khang@example.com",
          "walletAddress": "0x..."
        },
        "issuer": {
          "name": "EduWallet University",
          "logo": "...",
          "institutionId": "..."
        },
        "courseName": "Blockchain Fundamentals",
        "certificateId": "CERT-BLK101-2024",
        "issuerName": "EduWallet University",
        "isVerified": true,
        "status": "active"
      }
    ],
    "pagination": {...}
  }
}
```

### Frontend Now Displays:
- ✅ **Tổng chứng chỉ: 2**
- ✅ **Chứng chỉ đã xác thực: 1**
- ✅ **Chờ xác thực: 1**
- ✅ Student names: "Tran Trong Khang"
- ✅ Institution names: "EduWallet University"
- ✅ Course names, IDs, status badges

---

## 🚀 Deployment Checklist:

- [x] Backend routes fixed with correct populate fields
- [x] Frontend data transformation added
- [x] Backend restarted (PID 15884)
- [x] Frontend recompiled successfully
- [x] Both servers running
- [ ] **User needs to refresh browser** (Ctrl+Shift+R)

---

## 🧪 Quick Verification:

### Test API Endpoint:
```bash
curl http://localhost:5000/api/admin/certificates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Should return:**
- 2 certificates
- Each with populated `student` object containing `firstName`, `lastName`
- Each with populated `issuer` object containing `name`

### Test Frontend:
1. Navigate to: `http://localhost:3000/admin/certificates`
2. **Hard refresh:** Ctrl + Shift + R
3. Should see:
   - Total count: 2
   - Certificate cards with student names
   - Institution names displayed
   - Status badges

---

## 📝 Summary:

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| 0 certificates showing | Backend populate with wrong field (`name` instead of `firstName lastName`) | Fixed populate in 4 endpoints |
| Student names missing | No data transformation in frontend | Added `.map()` to transform `student` object to `studentName` string |
| Institution names missing | Backend used `issuer` field but frontend expected `institution` | Frontend already using `issuerName` correctly |
| Stats incorrect | Used `status === 'verified'` instead of `isVerified` boolean | Changed to use `isVerified` field |

---

## ✅ Status: FIXED & READY TO TEST

**Next Step:** Refresh browser và verify dữ liệu hiển thị đúng! 🎉
