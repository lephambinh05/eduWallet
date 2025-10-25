# 🔐 Admin Login - Quick Reference

## ✅ VERIFIED CREDENTIALS

```
📧 Email:    admin@example.com
🔑 Password: Admin123456
👑 Role:     super_admin
✅ Status:   active
```

**Verified:** 2025-10-14 ✅
**Password Hash:** Tested and confirmed working ✅

---

## 🚀 Login Now

### Step 1: Check Backend
Ensure backend is running on port 5000:
```
http://localhost:5000
```

You should see in terminal:
```
🚀 EduWallet Backend Server running on http://localhost:5000
👑 Admin endpoints: http://localhost:5000/api/admin/*
```

### Step 2: Check Frontend
Ensure frontend is running on port 3000:
```
http://localhost:3000
```

### Step 3: Login
1. Go to: `http://localhost:3000/admin/login`
2. Enter:
   - **Email:** `admin@example.com`
   - **Password:** `Admin123456`
3. Click **Login**
4. You will be redirected to: `http://localhost:3000/admin/dashboard`

---

## 🧪 Troubleshooting

### If login still fails:

#### 1. Verify Admin User Exists
```bash
cd backend
node check-admin.js
```

Expected output:
```
✅ Admin user found with email: admin@example.com
🔑 Testing password: "Admin123456"
   Result: ✅ MATCH
```

#### 2. Reset Password (if needed)
```bash
cd backend
node reset-admin-password.js
```

Expected output:
```
✅ SUCCESS! Admin credentials updated
📧 Email:    admin@example.com
🔑 Password: Admin123456
```

#### 3. Check Backend Port
Make sure backend is on port **5000**, not 3003:
```javascript
// backend/app-with-api.js
const PORT = process.env.PORT || 5000; // ✅ Correct
```

#### 4. Check Frontend API URL
Make sure frontend points to port **5000**:
```javascript
// src/services/adminService.js
const API_BASE_URL = 'http://localhost:5000/api'; // ✅ Correct
```

#### 5. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Or use Incognito mode

#### 6. Check Network Tab
- Open DevTools (F12)
- Go to Network tab
- Try login
- Check the `/api/auth/login` request

**Expected:**
```
Status: 200 OK
Response: {
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

**If 401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```
→ Run `node reset-admin-password.js` again

---

## 📝 Quick Commands

### Start Backend (Port 5000)
```bash
cd backend
node app-with-api.js
```

### Start Frontend (Port 3000)
```bash
cd ..
npm start
```

### Check Admin User
```bash
cd backend
node check-admin.js
```

### Reset Admin Password
```bash
cd backend
node reset-admin-password.js
```

---

## 🎯 Success Indicators

After successful login, you should see:

1. ✅ Toast notification: "Welcome back, admin!"
2. ✅ URL changes to: `/admin/dashboard`
3. ✅ Dashboard displays with:
   - 6 statistics cards
   - Recent activities
   - User statistics by role
4. ✅ Sidebar with navigation menu
5. ✅ No console errors
6. ✅ Token saved in localStorage:
   ```javascript
   localStorage.getItem('adminToken') // Should return JWT token
   localStorage.getItem('adminUser')  // Should return user object
   ```

---

## 🔄 If You Need to Reset Everything

### Complete Reset (Nuclear Option)
```bash
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Delete admin user from database
cd backend
node -e "const mongoose = require('mongoose'); const User = require('./src/models/User'); mongoose.connect('mongodb://localhost:27017/eduwallet').then(async () => { await User.deleteOne({ email: 'admin@example.com' }); console.log('Admin deleted'); process.exit(0); })"

# 3. Create new admin
node create-admin-quick.js

# 4. Reset password
node reset-admin-password.js

# 5. Restart backend
node app-with-api.js

# 6. Restart frontend (in new terminal)
cd ..
npm start

# 7. Try login again
```

---

## 📞 Support

If login still doesn't work after all steps:

1. Check terminal output for errors
2. Check browser console for errors
3. Verify MongoDB is running: `mongod --version`
4. Verify Node.js version: `node --version` (should be v14+)
5. Check `backend/logs` folder for error logs

---

**Last Verified:** 2025-10-14
**Status:** ✅ WORKING
**Password:** Tested and confirmed ✅
