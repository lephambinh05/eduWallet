# 🎉 MOCK API SERVER - READY TO TEST!

## ✅ STATUS: RUNNING

Mock Admin API Server đang chạy trên **http://localhost:5000** với fake data! 🚀

---

## 📊 Mock Data Available

### 📜 Certificates: **5 items**
- **3 Verified** (Nguyễn Văn A, Lê Văn C, Phạm Thị D)
- **2 Pending** (Trần Thị B, Hoàng Văn E)
- Courses: Blockchain Fundamentals, Smart Contracts, DApp Development, Web3 Security, NFT & Digital Assets

### 🎓 LearnPasses: **5 items**
- **3 Verified** (Nguyễn Văn A, Trần Thị B, Phạm Thị D)
- **2 Unverified** (Lê Văn C, Hoàng Văn E)
- **1 Suspended** (Lê Văn C - Academic integrity violation)
- **4 Active** (Others)
- GPA range: 3.50 - 3.90
- Courses completed: 1-5 per student

---

## 🧪 TESTING INSTRUCTIONS

### Step 1: Access Admin Panel
```
URL: http://localhost:3000/admin/login
```

Login credentials (from your existing admin):
- Username: `admin` hoặc email bạn đã tạo
- Password: Password của admin

### Step 2: Test Certificates Page

Navigate to: **http://localhost:3000/admin/certificates**

**Test Cases:**

✅ **View Certificate List**
- Should see 5 certificates with student names
- Each card shows: Course name, Student, Issuer, Grade, Status
- Status badges should be color-coded (verified=green, pending=yellow)

✅ **Search Certificates**
- Search "Blockchain" → Should find Blockchain Fundamentals
- Search "Nguyễn" → Should find Nguyễn Văn A's certificate
- Search "CERT-2024-1000" → Should find certificate by ID

✅ **Filter by Status**
- Select "Verified" → Should show 3 certificates
- Select "Pending" → Should show 2 certificates

✅ **View Certificate Details**
- Click "Chi tiết" button on any certificate
- Modal should open with 3 tabs:
  - **Details**: Student info, course info, skills
  - **Blockchain**: Transaction hash, block number, contract address, PolygonScan link
  - **Activities**: Timeline of events

✅ **Verify Pending Certificate**
- Open detail modal for "Trần Thị B" (Smart Contract Development)
- Click "Xác thực" button
- Success toast should appear
- Status should change to "verified"
- Modal should update

✅ **Revoke Certificate**
- Open any verified certificate
- Click "Thu hồi" button
- Enter reason: "Test revocation"
- Click confirm
- Status should change to "revoked"

### Step 3: Test LearnPasses Page

Navigate to: **http://localhost:3000/admin/learnpasses**

**Test Cases:**

✅ **View LearnPass List**
- Should see 5 LearnPasses
- Each card shows:
  - Student name, Student ID
  - Institution name
  - Progress bar (animated)
  - Courses completed / Total courses
  - Skills acquired
  - GPA
  - Status badge
  - Verification badge

✅ **Check Progress Bars**
- Nguyễn Văn A: 60% (3/5 courses)
- Trần Thị B: 83% (5/6 courses)
- Lê Văn C: 50% (2/4 courses)
- Phạm Thị D: 80% (4/5 courses)
- Hoàng Văn E: 33% (1/3 courses)

✅ **Search LearnPasses**
- Search "Trần" → Should find Trần Thị B
- Search "STU-20240001" → Should find Nguyễn Văn A
- Search "@example.com" → Should find all students

✅ **Filter by Status**
- Select "Active" → Should show 4 LearnPasses
- Select "Suspended" → Should show 1 (Lê Văn C)

✅ **Filter by Verification**
- Select "Verified" → Should show 3 LearnPasses
- Select "Unverified" → Should show 2 LearnPasses

✅ **View LearnPass Details**
- Click "Chi tiết" on any LearnPass
- Modal should open with 4 tabs:
  - **Profile**: Student info, institution, verification status
  - **Academic Progress**: 
    - Overall stats card (courses, skills, GPA, credits)
    - Course list with completion status
    - Skill tags with gradient colors
  - **Blockchain**: Token ID, transaction info, PolygonScan link
  - **Activities**: Timeline of all events

✅ **Verify Unverified LearnPass**
- Open "Hoàng Văn E" (unverified)
- Click "Xác thực" button
- Success toast should appear
- Verification badge should appear

✅ **Suspend Active LearnPass**
- Open any active LearnPass (e.g., Nguyễn Văn A)
- Click "Tạm ngưng" button
- Enter reason: "Test suspension"
- Click confirm
- Status should change to "suspended"

✅ **Reactivate Suspended LearnPass**
- Open "Lê Văn C" (suspended)
- Click "Kích hoạt lại" button
- Status should change to "active"

✅ **Revoke LearnPass**
- Open any LearnPass
- Click "Thu hồi vĩnh viễn" button
- Enter reason: "Test revocation"
- Click confirm
- Status should change to "revoked"

---

## 🎨 UI/UX Checks

### Visual Elements to Verify:

✅ **Colors & Status Badges**
- Verified: Green (#4CAF50)
- Pending: Yellow (#FFC107)
- Suspended: Orange (#FF9800)
- Revoked: Red (#F44336)
- Active: Green (#4CAF50)

✅ **Animations**
- Cards fade in when page loads
- Progress bars animate to percentage
- Hover effects on cards
- Modal slide-in animation
- Tab switching animation

✅ **Icons**
- Certificate icon in navigation
- Graduation cap icon for LearnPasses
- Action button icons (verify, revoke, suspend)
- Status icons

✅ **Responsive Design**
- Resize browser window
- Cards should reflow properly
- Mobile view should stack cards vertically

✅ **Loading States**
- Should show spinner when fetching data
- Should show "Loading..." message

✅ **Empty States**
- Try invalid search → Should show "Không tìm thấy kết quả"

---

## 🔍 API Testing (Optional)

You can also test API endpoints directly:

### Test Certificate Endpoints:

```bash
# Get all certificates
curl http://localhost:5000/api/admin/certificates

# Get certificate by ID
curl http://localhost:5000/api/admin/certificates/673d1e1f1234567890abcd01

# Verify certificate
curl -X POST http://localhost:5000/api/admin/certificates/673d1e1f1234567890abcd02/verify

# Revoke certificate
curl -X POST http://localhost:5000/api/admin/certificates/673d1e1f1234567890abcd01/revoke \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test revocation"}'
```

### Test LearnPass Endpoints:

```bash
# Get all LearnPasses
curl http://localhost:5000/api/admin/learnpasses

# Get LearnPass by ID
curl http://localhost:5000/api/admin/learnpasses/673d1e1f1234567890abce01

# Verify LearnPass
curl -X POST http://localhost:5000/api/admin/learnpasses/673d1e1f1234567890abce05/verify

# Suspend LearnPass
curl -X POST http://localhost:5000/api/admin/learnpasses/673d1e1f1234567890abce01/suspend \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test suspension"}'

# Reactivate LearnPass
curl -X POST http://localhost:5000/api/admin/learnpasses/673d1e1f1234567890abce03/reactivate

# Revoke LearnPass
curl -X POST http://localhost:5000/api/admin/learnpasses/673d1e1f1234567890abce01/revoke \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test revocation"}'
```

---

## 🐛 Troubleshooting

### Issue: "Không thể tải danh sách..."

**Solution:**
1. Check mock server is running: http://localhost:5000
2. Open browser DevTools → Network tab
3. Check if API calls are going to `http://localhost:5000`
4. If going to wrong URL, check `REACT_APP_API_URL` in `.env`

### Issue: No data showing

**Solution:**
1. Open browser console (F12)
2. Look for errors
3. Check Network tab for failed requests
4. Verify mock server terminal shows requests

### Issue: Actions not working

**Solution:**
1. Check browser console for errors
2. Verify API endpoints are being called
3. Check response in Network tab
4. Mock server should log requests

---

## 📝 Next Steps

**After Testing:**

1. ✅ **If everything works:** 
   - Feature is complete!
   - Can proceed to fix real backend later
   - Continue to Priority 2 features

2. ❌ **If issues found:**
   - Note down the bugs
   - Check browser console errors
   - Report back for fixes

3. 🔄 **To switch to real backend:**
   - Stop mock server (Ctrl+C)
   - Start real backend: `cd backend && npm start`
   - Fix database models
   - Seed real data

---

## 🎯 Success Criteria

Frontend implementation is **100% COMPLETE** if:

- ✅ Certificate list displays with 5 items
- ✅ LearnPass list displays with 5 items
- ✅ Search works for both pages
- ✅ Filters work correctly
- ✅ Detail modals open and show all tabs
- ✅ All actions (verify, revoke, suspend, reactivate) work
- ✅ Toast notifications appear
- ✅ Progress bars animate smoothly
- ✅ Blockchain links work
- ✅ No console errors

---

## 🚀 START TESTING NOW!

1. **Frontend should already be running** on http://localhost:3000
2. **Mock API is running** on http://localhost:5000
3. **Go to:** http://localhost:3000/admin/certificates
4. **Follow test cases above** ⬆️

**HAVE FUN TESTING!** 🎉
