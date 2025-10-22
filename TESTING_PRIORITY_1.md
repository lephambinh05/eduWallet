# 🧪 TESTING GUIDE - Priority 1 Features

## 📋 Checklist Testing

### Chuẩn bị:
- [ ] Backend đang chạy: `cd backend && npm start` (port 5000)
- [ ] Frontend đang chạy: `npm start` (port 3000)
- [ ] MongoDB đang chạy
- [ ] Đã có admin user (admin@example.com / Admin123456)

---

## 1️⃣ TEST: User Detail/Edit Modal

### A. Mở Modal
**Steps:**
1. Login admin tại `/admin/login`
2. Navigate to `/admin/users`
3. Click nút **View (Eye icon)** trên bất kỳ user nào

**Expected:**
- ✅ Modal mở ra với animation smooth
- ✅ Hiển thị avatar của user
- ✅ Hiển thị đầy đủ thông tin: name, email, role, status
- ✅ Header có gradient purple đẹp
- ✅ Có 2 tabs: Details và Activities

---

### B. View User Details Tab
**Steps:**
1. Trong modal, đảm bảo đang ở tab "Details"
2. Xem các sections:
   - Personal Information
   - Role & Permissions
   - Account Status

**Expected:**
- ✅ Hiển thị đầy đủ fields: username, email, first name, last name, phone, DOB
- ✅ Role hiển thị với colored badges
- ✅ Status hiển thị (Active/Inactive/Blocked)
- ✅ Created At, Updated At, Last Login hiển thị đúng
- ✅ Email verified badge nếu có

---

### C. Edit User Information
**Steps:**
1. Click nút **"Edit"** (màu blue)
2. Form chuyển sang edit mode
3. Thay đổi: First Name = "TestEdit"
4. Click **"Save Changes"**

**Expected:**
- ✅ Các input fields trở nên editable
- ✅ Nút đổi thành "Save Changes" và "Cancel"
- ✅ Toast success: "User updated successfully!"
- ✅ Modal tự động tắt
- ✅ User list refresh với data mới
- ✅ Backend log activity

**Error Cases:**
- [ ] Thử xóa email → Should show validation error
- [ ] Thử nhập username < 3 chars → Should show error
- [ ] Thử nhập invalid email → Should show error

---

### D. Change User Role
**Steps:**
1. Mở user modal (non-admin user)
2. Scroll down to "Role & Permissions" section
3. Click vào role khác (ví dụ: institution)
4. Confirm dialog

**Expected:**
- ✅ Confirmation dialog hiện ra
- ✅ Toast success: "Role updated to institution"
- ✅ Role badge update ngay lập tức
- ✅ Backend log activity

---

### E. Activate/Deactivate User
**Steps:**
1. Mở user modal (active user)
2. Click nút **"Deactivate"** (màu vàng/warning)
3. Nhập reason (optional)
4. Confirm

**Expected:**
- ✅ Prompt nhập lý do
- ✅ Toast success: "User deactivated successfully"
- ✅ Status badge đổi sang "Inactive"
- ✅ Nút đổi thành "Activate"

**Then test activate:**
5. Click **"Activate"**
6. Toast success

**Expected:**
- ✅ Status badge đổi lại "Active"
- ✅ Nút đổi lại thành "Deactivate"

---

### F. Block/Unblock User
**Steps:**
1. Mở user modal (non-blocked user)
2. Click nút **"Block"** (màu đỏ)
3. Nhập reason trong prompt: "Testing block feature"
4. OK

**Expected:**
- ✅ Toast success: "User blocked successfully"
- ✅ Status badge đổi thành "Blocked" (màu đỏ)
- ✅ isActive cũng set thành false
- ✅ Nút đổi thành "Unblock"

**Then test unblock:**
5. Click **"Unblock"**
6. Confirm

**Expected:**
- ✅ Toast success: "User unblocked successfully"
- ✅ Status trở lại Active
- ✅ Nút đổi lại thành "Block"

---

### G. View User Activities Tab
**Steps:**
1. Trong modal, click tab **"Activities"**
2. Đợi load activities

**Expected:**
- ✅ Tab switch smooth
- ✅ Hiển thị list các activities của user
- ✅ Mỗi activity có:
  - Icon (emoji)
  - Action name
  - Details
  - Timestamp
- ✅ Nếu không có activities: Empty state với icon và message
- ✅ Activities sorted by newest first

---

### H. Close Modal
**Steps:**
1. Click X button góc phải header
2. Hoặc click outside modal (overlay)

**Expected:**
- ✅ Modal đóng với animation
- ✅ Không có memory leak
- ✅ User list vẫn hiển thị bình thường

---

## 2️⃣ TEST: Create User Modal

### A. Mở Create User Modal
**Steps:**
1. Ở trang `/admin/users`
2. Click nút **"Create User"** (màu xanh lá, góc phải)

**Expected:**
- ✅ Modal mở với animation
- ✅ Header gradient purple với icon
- ✅ Title: "Create New User"
- ✅ Form trống, sẵn sàng nhập

---

### B. Test Form Validation - Required Fields
**Steps:**
1. Click **"Create User"** mà không nhập gì
2. Hoặc nhập thiếu các field

**Expected:**
- ✅ Toast error: "Please fix the errors in the form"
- ✅ Red border trên các fields lỗi
- ✅ Error text hiển thị dưới mỗi field:
  - "Username is required"
  - "Email is required"
  - "Password is required"
  - "First name is required"
  - "Last name is required"
  - "Date of birth is required"

---

### C. Test Username Validation
**Steps:**
1. Nhập username: "ab" (< 3 chars)
2. Tab ra khỏi field

**Expected:**
- ✅ Error: "Username must be at least 3 characters"

**Steps:**
3. Nhập username: "test user" (có space)

**Expected:**
- ✅ Error: "Username can only contain letters, numbers, and underscores"

**Steps:**
4. Nhập username: "testuser123" (valid)

**Expected:**
- ✅ Error biến mất
- ✅ Border đổi lại màu xanh khi focus

---

### D. Test Email Validation
**Steps:**
1. Nhập email: "notanemail"

**Expected:**
- ✅ Error: "Invalid email format"

**Steps:**
2. Nhập email: "test@example.com" (valid)

**Expected:**
- ✅ Error biến mất

---

### E. Test Password Validation
**Steps:**
1. Nhập password: "123" (< 8 chars)

**Expected:**
- ✅ Error: "Password must be at least 8 characters"

**Steps:**
2. Nhập password: "Test123456"
3. Nhập confirm password: "Test123" (khác)

**Expected:**
- ✅ Error trên confirm password: "Passwords do not match"

**Steps:**
4. Nhập confirm password: "Test123456" (match)

**Expected:**
- ✅ Error biến mất

---

### F. Test Phone Validation (Optional)
**Steps:**
1. Leave phone empty → OK (optional field)
2. Nhập phone: "abc123"

**Expected:**
- ✅ Error: "Invalid phone number format"

**Steps:**
3. Nhập phone: "+84123456789" hoặc "0123456789"

**Expected:**
- ✅ Error biến mất

---

### G. Test Date of Birth Validation
**Steps:**
1. Chọn date: Tomorrow (future date)

**Expected:**
- ✅ Error: "Date of birth must be in the past"

**Steps:**
2. Chọn date: 1990-01-01 (valid)

**Expected:**
- ✅ Error biến mất

---

### H. Select User Role
**Steps:**
1. Mặc định role: "Student" (selected)
2. Click vào các role khác: Institution, Admin, Super Admin
3. Mỗi role click sẽ highlight

**Expected:**
- ✅ Only one role selected at a time
- ✅ Selected role có border xanh và background nhạt
- ✅ Icons và descriptions hiển thị đẹp

---

### I. Set Account Settings
**Steps:**
1. Default: "Active Account" = checked, "Email Verified" = unchecked
2. Toggle các checkboxes

**Expected:**
- ✅ Checkboxes work smoothly
- ✅ Descriptions hiển thị rõ ràng

---

### J. Create Valid User - Success Case
**Steps:**
1. Điền form hoàn chỉnh:
   - Username: "johndoe123"
   - Email: "john.doe@example.com"
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
   - First Name: "John"
   - Last Name: "Doe"
   - Phone: "+84123456789"
   - Date of Birth: "1995-05-15"
   - Role: Student
   - Active: checked
   - Email Verified: checked
2. Click **"Create User"**

**Expected:**
- ✅ Button text: "Creating..." (loading state)
- ✅ Button disabled during creation
- ✅ Toast success: "User created successfully!"
- ✅ Modal đóng automatically
- ✅ User list refresh
- ✅ User mới xuất hiện ở đầu list (hoặc theo sort)

---

### K. Create User - Backend Error Case
**Steps:**
1. Tạo user với email đã tồn tại: "admin@example.com"
2. Click Create

**Expected:**
- ✅ Toast error: "User with this email or username already exists"
- ✅ Modal không đóng
- ✅ Form giữ nguyên data
- ✅ User có thể sửa và thử lại

---

### L. Cancel Creation
**Steps:**
1. Nhập một số data vào form
2. Click **"Cancel"** button

**Expected:**
- ✅ Modal đóng
- ✅ Form data bị clear (không lưu)
- ✅ User list không thay đổi

---

## 3️⃣ TEST: Activity Logs Page

### A. Navigate to Activities Page
**Steps:**
1. Login admin
2. Click **"Activities"** trong sidebar menu
3. Hoặc navigate to `/admin/activities`

**Expected:**
- ✅ Page loads
- ✅ Title: "Activity Logs" với icon
- ✅ Hiển thị total count: "X total activities"
- ✅ 2 buttons: "Show Filters" và "Export"

---

### B. View Activities List
**Steps:**
1. Xem list activities hiển thị

**Expected:**
- ✅ Activities hiển thị dạng timeline/cards
- ✅ Mỗi activity card có:
  - Icon với màu sắc theo action type
  - Action label (User Created, User Updated, etc.)
  - Performed by user (username + email)
  - Target user (nếu có)
  - Details (JSON format)
  - Timestamp (relative: "2h ago" hoặc full date)
  - IP address (nếu có)
  - Status badge (success/fail)
- ✅ Border left màu xanh
- ✅ Hover effect: card nâng lên

---

### C. Test Action Icons & Colors
**Check các icons:**
- ✅ User Created → Green Plus icon
- ✅ User Updated → Blue Edit icon
- ✅ User Deleted → Red Trash icon
- ✅ User Blocked → Orange Ban icon
- ✅ User Unblocked → Green Check icon
- ✅ Role Changed → Purple Shield icon
- ✅ Status Changed → Blue User icon

---

### D. Show/Hide Filters
**Steps:**
1. Click **"Show Filters"**

**Expected:**
- ✅ Filter panel xuất hiện với animation
- ✅ Button text đổi thành "Hide Filters"
- ✅ 3 filter options:
  - Action Type (dropdown)
  - Start Date (date picker)
  - End Date (date picker)
- ✅ Clear Filters button

**Steps:**
2. Click **"Hide Filters"**

**Expected:**
- ✅ Panel đóng với animation
- ✅ Button text đổi lại

---

### E. Filter by Action Type
**Steps:**
1. Click "Show Filters"
2. Select Action Type = "User Created"
3. Activities auto-refresh

**Expected:**
- ✅ Chỉ hiển thị activities "User Created"
- ✅ Total count update
- ✅ Pagination reset về page 1
- ✅ No page reload (smooth filter)

**Steps:**
4. Select Action Type = "User Deleted"

**Expected:**
- ✅ Chỉ hiển thị delete activities
- ✅ List update instantly

---

### F. Filter by Date Range
**Steps:**
1. Set Start Date = 1 tuần trước
2. Set End Date = today
3. Activities filter

**Expected:**
- ✅ Chỉ hiển thị activities trong khoảng thời gian
- ✅ Count update
- ✅ Pagination update

---

### G. Combined Filters
**Steps:**
1. Action Type = "User Updated"
2. Start Date = 3 ngày trước
3. End Date = today

**Expected:**
- ✅ Activities match cả action type VÀ date range
- ✅ List đúng

---

### H. Clear Filters
**Steps:**
1. Áp dụng một số filters
2. Click **"Clear Filters"**

**Expected:**
- ✅ All filters reset về default
- ✅ Activities list hiển thị tất cả
- ✅ Count quay lại total

---

### I. Test Pagination
**Steps:**
1. Nếu có > 50 activities
2. Xem pagination xuất hiện bottom
3. Click **"Next"**

**Expected:**
- ✅ Page 2 loads
- ✅ Activities 51-100 hiển thị
- ✅ Page number highlight
- ✅ "Previous" button enabled
- ✅ Pagination info: "Showing 51 to 100 of X activities"

**Steps:**
4. Click page number trực tiếp (e.g., page 3)

**Expected:**
- ✅ Jump to page 3
- ✅ Activities load correctly

**Steps:**
5. Click **"Previous"**

**Expected:**
- ✅ Back to page 2

---

### J. Test Empty State
**Steps:**
1. Apply filters mà không có activities match
2. Ví dụ: Action Type = "User Deleted" + Date range không có activity

**Expected:**
- ✅ Empty state hiển thị:
  - Large history icon (faded)
  - "No Activities Found"
  - "There are no activity logs matching your filters."
- ✅ No pagination
- ✅ Filters vẫn có thể adjust

---

### K. Test Loading State
**Steps:**
1. Reload page
2. Observe loading state

**Expected:**
- ✅ Spinner hiển thị
- ✅ Text: "Loading activities..."
- ✅ Centered on page

---

### L. Export Activities (Placeholder)
**Steps:**
1. Click **"Export"** button

**Expected:**
- ✅ Toast: "Export feature coming soon!"
- ✅ (Sẽ implement sau)

---

## 4️⃣ INTEGRATION TESTS

### A. Create User → View in List → Edit → View Activities
**Full Flow:**
1. Create user "testuser123" với Create User modal
2. ✅ User xuất hiện trong list
3. Click View trên user vừa tạo
4. ✅ Modal mở với đúng data
5. Edit: Đổi first name
6. ✅ Save thành công
7. Click tab Activities
8. ✅ Thấy activity "user_created" và "user_updated"
9. Close modal
10. Go to `/admin/activities`
11. ✅ Thấy 2 activities mới trong timeline

---

### B. Block User → Check Activities → Unblock
**Full Flow:**
1. Open user modal (non-blocked user)
2. Block user với reason
3. ✅ Status đổi thành Blocked
4. Close modal
5. Go to Activities page
6. ✅ Thấy "User Blocked" activity với reason
7. Back to Users
8. Reopen same user
9. Unblock user
10. ✅ Status active lại
11. Check activities
12. ✅ Thấy "User Unblocked" activity

---

### C. Bulk Delete → Check Activities
**Full Flow:**
1. Select 3 users với checkboxes
2. Click "Bulk Delete"
3. Confirm
4. ✅ Toast success
5. Go to Activities
6. ✅ Thấy "Bulk Delete" activity với count: 3

---

## 5️⃣ RESPONSIVE TESTING

### Mobile View (< 768px)
**Test trên:**
- [ ] iPhone 12 Pro (390px)
- [ ] Samsung Galaxy S21 (360px)

**Expected:**
- ✅ Modals full width với padding
- ✅ Form fields stack vertically
- ✅ Buttons stack
- ✅ Table scrollable horizontal
- ✅ Activities cards full width
- ✅ Filter panel responsive

### Tablet View (768px - 1024px)
**Expected:**
- ✅ Modals max-width 900px centered
- ✅ Form grid 2 columns
- ✅ Everything readable

---

## 6️⃣ BROWSER TESTING

Test trên:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 🐛 KNOWN ISSUES / BUGS TO REPORT

Ghi lại mọi bug bạn tìm thấy:

1. **Bug:**
   - Description:
   - Steps to reproduce:
   - Expected:
   - Actual:
   - Screenshot:

---

## ✅ TESTING COMPLETION

### Summary:
- [ ] UserDetailModal: __/8 tests passed
- [ ] CreateUserModal: __/12 tests passed  
- [ ] AdminActivities: __/12 tests passed
- [ ] Integration: __/3 flows passed
- [ ] Responsive: __/2 sizes passed
- [ ] Browsers: __/4 browsers passed

**Overall:** ___% Complete

---

## 📸 SCREENSHOTS NEEDED

Please take screenshots of:
1. UserDetailModal - Details tab
2. UserDetailModal - Activities tab
3. UserDetailModal - Edit mode
4. CreateUserModal - Empty form
5. CreateUserModal - With validation errors
6. AdminActivities - Full list
7. AdminActivities - With filters
8. AdminActivities - Empty state

---

**Tester:** _____________
**Date:** _____________
**Duration:** _____________
**Status:** [ ] Pass [ ] Fail [ ] Partial

