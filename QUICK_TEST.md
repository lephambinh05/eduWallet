# 🚀 QUICK TEST REFERENCE - Priority 1

## 🎯 3 Tính năng cần test:

### 1. User Detail/Edit Modal
**Location:** `/admin/users` → Click eye icon
**Features:**
- ✅ View user details
- ✅ Edit user info (click Edit button)
- ✅ Change role (click role badges)
- ✅ Activate/Deactivate
- ✅ Block/Unblock
- ✅ View activities (tab Activities)

### 2. Create User Modal  
**Location:** `/admin/users` → Click "Create User"
**Features:**
- ✅ Full form validation
- ✅ Required fields check
- ✅ Password match
- ✅ Email format
- ✅ Username rules
- ✅ Role selection
- ✅ Success toast

### 3. Activity Logs Page
**Location:** `/admin/activities`
**Features:**
- ✅ Timeline view
- ✅ Filter by action type
- ✅ Filter by date range
- ✅ Pagination
- ✅ Colored icons
- ✅ Detailed info

---

## ⚡ Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
npm start
```

Or just run:
```bash
quick-test.bat
```

---

## 🔑 Admin Login

**URL:** http://localhost:3000/admin/login

```
Email:    admin@example.com
Password: Admin123456
```

---

## 🧪 Quick Manual Tests

### Test 1: View User (30 seconds)
1. Go to `/admin/users`
2. Click eye icon on any user
3. ✅ Modal opens with user info
4. Click X to close

### Test 2: Edit User (1 minute)
1. Open user modal
2. Click "Edit" button
3. Change First Name to "TestEdit"
4. Click "Save Changes"
5. ✅ Toast success
6. ✅ User updated in list

### Test 3: Create User (2 minutes)
1. Click "Create User" button
2. Fill form:
   - Username: testuser123
   - Email: test@example.com
   - Password: Test123456
   - Confirm: Test123456
   - First Name: Test
   - Last Name: User
   - DOB: 1990-01-01
   - Role: Student
3. Click "Create User"
4. ✅ User appears in list

### Test 4: Block User (1 minute)
1. Open user modal
2. Click "Block" button
3. Enter reason: "Testing"
4. ✅ Status changes to Blocked
5. Click "Unblock"
6. ✅ Status back to Active

### Test 5: Activities (1 minute)
1. Go to `/admin/activities`
2. ✅ See all recent activities
3. Click "Show Filters"
4. Select Action Type: "User Created"
5. ✅ List filters correctly
6. Click "Clear Filters"
7. ✅ Shows all again

---

## 🐛 Common Issues & Fixes

### Issue: Modal không mở
**Fix:** 
- Check console (F12) for errors
- Verify token: `localStorage.getItem('adminToken')`
- Try logout & login lại

### Issue: "401 Unauthorized"
**Fix:**
```javascript
// Clear & re-login
localStorage.clear();
// Go to /admin/login
```

### Issue: Backend not responding
**Fix:**
```bash
cd backend
npm start
# Check port 5000 is free
```

### Issue: "User already exists"
**Fix:** Use unique username/email mỗi lần test create

---

## 📊 Browser Console Tests

Press F12, paste vào Console:

```javascript
// Check admin session
console.log('Token:', localStorage.getItem('adminToken'));
console.log('User:', JSON.parse(localStorage.getItem('adminUser')));

// Test API
fetch('http://localhost:5000/api/admin/dashboard', {
  headers: { 
    'Authorization': 'Bearer ' + localStorage.getItem('adminToken') 
  }
}).then(r => r.json()).then(console.log);

// Clear session
localStorage.clear(); location.reload();
```

Or load full test utilities:
```javascript
// Copy paste from console-tests.js
```

---

## ✅ Test Checklist (Minimal)

**UserDetailModal:**
- [ ] Opens correctly
- [ ] Shows user info
- [ ] Edit works
- [ ] Role change works
- [ ] Block/Unblock works
- [ ] Activities tab works

**CreateUserModal:**
- [ ] Opens correctly
- [ ] Validation works
- [ ] Can create user
- [ ] Shows errors
- [ ] Success toast

**ActivityLogs:**
- [ ] Page loads
- [ ] Shows activities
- [ ] Filters work
- [ ] Pagination works

---

## 📸 Success Screenshots Needed

1. UserDetailModal open
2. CreateUserModal filled
3. Activities page with filters
4. Success toast notification
5. User list with new user

---

## 🎯 Expected Results

After all tests:
- ✅ No console errors
- ✅ All modals open/close smoothly
- ✅ All forms validate correctly
- ✅ All API calls succeed
- ✅ All toast notifications show
- ✅ UI responsive
- ✅ No memory leaks

---

## 📞 Need Help?

**Check:**
1. `TESTING_PRIORITY_1.md` - Detailed test cases
2. `PRIORITY_1_COMPLETED.md` - Implementation details
3. Browser Console (F12) - Error messages
4. Backend logs - API errors

**Common Commands:**
```bash
# Check backend status
curl http://localhost:5000/api/health

# Check admin endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/dashboard

# Kill port if stuck
npx kill-port 3000 5000
```

---

**Ready to test?** 🚀

1. Run `quick-test.bat`
2. Wait for servers
3. Open http://localhost:3000/admin/login
4. Login with admin credentials
5. Follow tests above!

**Time needed:** ~10-15 minutes for basic tests

