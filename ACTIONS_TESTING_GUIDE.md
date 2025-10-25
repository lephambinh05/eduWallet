# ✅ CERTIFICATE & LEARNPASS ACTIONS - TESTING GUIDE

## 🎯 Available Actions:

### 📜 Certificate Actions:

#### 1. **Xác thực (Verify)**
- **Khi nào hiển thị:** Certificate chưa verified (`isVerified = false`) và `status = 'active'`
- **Action:** POST `/api/admin/certificates/:id/verify`
- **Effect:** Set `isVerified = true`
- **UI:** Button "Xác thực" với icon ✓

#### 2. **Thu hồi (Revoke)**
- **Khi nào hiển thị:** Certificate `status = 'active'`
- **Action:** POST `/api/admin/certificates/:id/revoke`
- **Params:** `{ reason: string }`
- **Effect:** Set `status = 'revoked'`
- **UI:** Button "Thu hồi" với icon 🚫

---

### 🎓 LearnPass Actions:

#### 1. **Xác thực (Verify)**
- **Khi nào hiển thị:** LearnPass chưa verified (`isVerified = false`)
- **Action:** POST `/api/admin/learnpasses/:id/verify`
- **Effect:** Set `isVerified = true`
- **UI:** Button "Xác thực" với icon ✓

#### 2. **Tạm dừng (Suspend)**
- **Khi nào hiển thị:** LearnPass `status = 'active'`
- **Action:** POST `/api/admin/learnpasses/:id/suspend`
- **Params:** `{ reason: string }`
- **Effect:** Set `status = 'suspended'`
- **UI:** Button "Tạm dừng" với icon ⏸

#### 3. **Kích hoạt (Reactivate)**
- **Khi nào hiển thị:** LearnPass `status = 'suspended'`
- **Action:** POST `/api/admin/learnpasses/:id/reactivate`
- **Effect:** Set `status = 'active'`
- **UI:** Button "Kích hoạt" với icon ▶

#### 4. **Thu hồi (Revoke)**
- **Khi nào hiển thị:** LearnPass `status = 'active'` hoặc `'suspended'`
- **Action:** POST `/api/admin/learnpasses/:id/revoke`
- **Params:** `{ reason: string }`
- **Effect:** Set `status = 'revoked'`
- **UI:** Button "Thu hồi" với icon 🚫

---

## 🧪 Testing Workflow:

### Test Certificate Actions:

1. **Navigate to Certificates:**
   ```
   http://localhost:3000/admin/certificates
   ```

2. **Test Verify (Certificate #2 - Pending):**
   - Click on "Smart Contract Development" certificate (isVerified = false)
   - Detail modal opens
   - Should see "Xác thực" button
   - Click "Xác thực"
   - Confirm dialog: "Bạn có chắc muốn xác thực chứng chỉ này?"
   - Click OK
   - ✅ Success toast: "Xác thực chứng chỉ thành công!"
   - Modal closes, list refreshes
   - Stats update: "Đã xác thực" count increases

3. **Test Revoke (Certificate #1 - Verified):**
   - Click on "Blockchain Fundamentals" certificate
   - Should see "Thu hồi" button
   - Click "Thu hồi"
   - Prompt: "Lý do thu hồi chứng chỉ:"
   - Enter reason: "Test revocation"
   - Click OK
   - ✅ Success toast: "Thu hồi chứng chỉ thành công!"
   - Modal closes, list refreshes
   - Stats update: "Thu hồi" count increases

---

### Test LearnPass Actions:

1. **Navigate to LearnPasses:**
   ```
   http://localhost:3000/admin/learnpasses
   ```

2. **Test Verify (if any unverified):**
   - Click on LearnPass card
   - If "Xác thực" button visible
   - Click → Confirm → ✅ Success

3. **Test Suspend (Active LearnPass):**
   - Click on active LearnPass
   - Should see "Tạm dừng" button
   - Click "Tạm dừng"
   - Prompt: "Lý do tạm dừng LearnPass:"
   - Enter: "Testing suspension"
   - ✅ Success toast: "Tạm dừng LearnPass thành công!"
   - Status changes to "Tạm dừng"

4. **Test Reactivate (Suspended LearnPass):**
   - Click on suspended LearnPass
   - Should see "Kích hoạt" button (not "Tạm dừng")
   - Click "Kích hoạt"
   - Confirm dialog
   - ✅ Success toast: "Kích hoạt LearnPass thành công!"
   - Status changes back to "Hoạt động"

5. **Test Revoke:**
   - Click on active/suspended LearnPass
   - Should see "Thu hồi" button
   - Click "Thu hồi"
   - Enter reason
   - ✅ Success toast: "Thu hồi LearnPass thành công!"
   - Status changes to "Đã thu hồi"
   - Cannot reactivate or suspend revoked LearnPass

---

## 📊 Current Data State:

### Certificates (2 items):
```
1. "Blockchain Fundamentals" (CERT-2024-1000)
   - isVerified: true ✅
   - status: 'active'
   - Actions available: Thu hồi

2. "Smart Contract Development" (CERT-2024-1001)
   - isVerified: false ❌
   - status: 'active'
   - Actions available: Xác thực, Thu hồi
```

### LearnPasses (2 items):
```
1. STU-20240001 - Tran Trong Khang
   - isVerified: true ✅
   - status: 'active'
   - Actions: Tạm dừng, Thu hồi

2. STU-20240002 - Tran Trong Khang
   - isVerified: true ✅
   - status: 'active'
   - Actions: Tạm dừng, Thu hồi
```

---

## ✅ Success Criteria:

- [x] All action buttons render correctly based on status
- [x] Confirmation dialogs appear before actions
- [x] Reason prompts for suspend/revoke actions
- [x] Success toast notifications show
- [x] List auto-refreshes after action
- [x] Stats update immediately
- [x] Modal closes after action
- [x] Loading states during API calls
- [x] Error handling with error toasts

---

## 🐛 Troubleshooting:

### Button không hiển thị:
- Check certificate/learnpass status in console
- Verify `isVerified` boolean value
- Check `status` field value

### Action fails:
- Check backend is running (port 5000)
- Check authentication token
- Check Network tab for API errors
- Check backend logs

### List không refresh:
- Check `onUpdate()` is called in action handlers
- Check parent component has `fetchCertificates()` / `fetchLearnPasses()`

---

## 🎯 QUICK TEST NOW:

1. Hard refresh browser: `Ctrl + Shift + R`
2. Go to Certificates page
3. Click on "Smart Contract Development" 
4. Click "Xác thực"
5. Should see success toast ✅

**ALL FEATURES IMPLEMENTED AND READY! 🎉**
