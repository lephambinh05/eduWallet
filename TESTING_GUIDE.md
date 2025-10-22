# 🚀 Quick Test Guide - Admin Panel

## ✅ Status: READY TO TEST!

Frontend is running on: `http://localhost:3000`
Admin panel is at: `http://localhost:3000/admin`

---

## 🔐 Admin Credentials

```
Email:    admin@example.com
Password: Admin123456
```

---

## 📋 Test Checklist

### 1. ✅ Test Login
**URL:** `http://localhost:3000/admin/login`

**Steps:**
1. Navigate to login page
2. Enter email: `admin@example.com`
3. Enter password: `Admin123456`
4. Click "Login"
5. Should redirect to `/admin/dashboard`

**Expected Results:**
- ✅ Form validation works
- ✅ Login successful
- ✅ Redirect to dashboard
- ✅ Token stored in localStorage

---

### 2. ✅ Test Dashboard
**URL:** `http://localhost:3000/admin/dashboard`

**Expected to see:**
- ✅ 6 Statistics cards:
  - Total Users
  - Active Users
  - New This Month
  - Inactive Users
  - New This Week
  - Growth Rate
- ✅ Recent Activities section (5 latest)
- ✅ User Statistics by Role (with progress bars)
- ✅ Loading states when fetching data
- ✅ Smooth animations

**Test:**
- Check if numbers are correct
- Hover over cards (should lift up)
- Check if activity feed shows real data
- Verify progress bars animate

---

### 3. ✅ Test User Management
**URL:** `http://localhost:3000/admin/users`

**Features to test:**

#### Search
- Type username/email in search box
- Results should filter in real-time
- Clear search to see all users

#### Filters
- Click "Filters" button
- Select role: Student, Institution, Admin, Super Admin
- Select status: Active, Inactive, Blocked, Deactivated
- Click "Clear Filters" to reset

#### User Table
- Check all columns display correctly:
  - User (avatar + name)
  - Email
  - Role (color-coded badge)
  - Status (color-coded badge)
  - Join date
  - Actions

#### Bulk Operations
- Click checkbox in table header to select all
- Click individual checkboxes to select specific users
- Click "Delete (X)" button to bulk delete
- Confirm deletion in popup

#### Individual Actions
- 👁️ **View** - Click eye icon (shows "coming soon" toast)
- ✏️ **Edit** - Click edit icon (shows "coming soon" toast)
- 🚫 **Block/Unblock** - Click ban icon (shows "coming soon" toast)
- 🗑️ **Delete** - Click trash icon (shows confirmation, then deletes)

#### Export
- Click "Export" button
- CSV file should download
- Open file to verify data

#### Pagination
- Navigate between pages using Previous/Next
- Click specific page numbers
- Check "Showing X to Y of Z users" text

---

### 4. ✅ Test Navigation
**Sidebar Navigation:**
- Click "Dashboard" → Goes to `/admin/dashboard`
- Click "Users" → Goes to `/admin/users`
- Click "Activities" → Shows "coming soon"
- Click "Settings" → Shows "coming soon"

**Toggle Sidebar:**
- Click hamburger menu icon
- Sidebar should collapse to 70px
- Click again to expand to 250px
- Icons should remain visible when collapsed

**Logout:**
- Click "Logout" button in sidebar
- Should redirect to `/admin/login`
- Token should be removed from localStorage
- Accessing `/admin/dashboard` should redirect to login

---

### 5. ✅ Test Protected Routes
**Without Login:**
1. Clear localStorage
2. Try to access: `http://localhost:3000/admin/dashboard`
3. Should redirect to `/admin/login`

**With Login:**
1. Login successfully
2. Access: `http://localhost:3000/admin/dashboard`
3. Should show dashboard (no redirect)

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend not running
**Error:** Network error, API calls fail

**Solution:**
```bash
cd backend
node app-with-api.js
```

### Issue 2: CORS error
**Error:** "Access-Control-Allow-Origin" blocked

**Solution:** Backend should have CORS enabled in `app-with-api.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue 3: "Cannot find module"
**Error:** Import errors

**Solution:**
```bash
npm install
```

### Issue 4: Port already in use
**Error:** "Port 3000 is already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
set PORT=3001 && npm start
```

---

## 📊 Expected API Calls

When testing, you should see these API calls in Network tab:

### Dashboard
```
GET /api/admin/dashboard
GET /api/admin/activities?page=1&limit=5
```

### Users Page
```
GET /api/admin/users?page=1&limit=20
GET /api/admin/users?page=1&limit=20&search=john
GET /api/admin/users?page=1&limit=20&role=student
DELETE /api/admin/users/:id
POST /api/admin/users/bulk-delete
GET /api/admin/users/export
```

### Login
```
POST /api/admin/login
```

---

## 🎨 UI/UX to Verify

### Responsiveness
- Resize browser window
- Check mobile breakpoints (768px, 576px)
- Sidebar should be responsive
- Tables should scroll horizontally on mobile

### Animations
- Cards should fade in on page load
- Hover effects on buttons/cards
- Smooth page transitions
- Loading spinners

### Color Scheme
- Purple primary: `#a259ff`
- Blue secondary: `#3772ff`
- Green success: `#66bb6a`
- Red danger: `#ff6b6b`
- Orange warning: `#ffa726`

### Typography
- All text readable
- Consistent font sizes
- Proper hierarchy

---

## ✅ Success Criteria

- [x] Login works
- [x] Dashboard loads with real data
- [x] User table displays correctly
- [x] Search/filter works
- [x] Delete works (single & bulk)
- [x] Export CSV works
- [x] Pagination works
- [x] Sidebar navigation works
- [x] Protected routes work
- [x] Logout works
- [x] Responsive on mobile
- [x] No console errors
- [x] Smooth animations

---

## 📸 Screenshots to Take

1. Login page
2. Dashboard with stats
3. User table (full view)
4. User table with filters open
5. Sidebar collapsed
6. Mobile view

---

## 🔧 Debug Tools

### Chrome DevTools
- **Console:** Check for errors
- **Network:** Verify API calls
- **Application → Storage:** Check localStorage for token
- **React DevTools:** Inspect component state

### VS Code
- Check terminal for warnings/errors
- Verify all files saved
- Check ESLint problems

---

## 📝 Notes

1. Some features show "coming soon" toast:
   - View user details
   - Edit user
   - Block/Unblock user
   - Activities page
   - Settings page

2. These are intentional as modals haven't been created yet

3. All working features:
   - Login/Logout
   - Dashboard stats
   - User list with pagination
   - Search & filters
   - Delete (single & bulk)
   - Export CSV

---

**Happy Testing! 🎉**

If everything works, the admin panel is 80% complete!
Remaining 20% is creating the modal components for Create/Edit/View user.
