# Admin Feature Module

## 📁 Folder Structure

This folder contains all admin panel related code, organized using a feature-based architecture pattern.

```
src/features/admin/
├── components/          # Reusable admin UI components
│   ├── AdminRoute.js    # Protected route wrapper for admin pages
│   ├── AdminLayout.js   # Main admin panel layout with sidebar/topbar
│   ├── StatsCard.js     # Dashboard statistics card component
│   └── index.js         # Barrel exports for components
│
├── pages/              # Admin page components
│   ├── AdminLogin.js    # Admin authentication page
│   ├── AdminDashboard.js # Admin dashboard with stats & activities
│   ├── AdminUsers.js    # User management page
│   └── index.js         # Barrel exports for pages
│
├── context/            # Admin state management
│   ├── AdminContext.js  # Admin authentication context & provider
│   └── index.js         # Barrel exports for context
│
├── services/           # Admin API services
│   ├── adminService.js  # Admin API client with 20+ methods
│   └── index.js         # Barrel exports for services
│
└── index.js            # Main barrel export for entire admin feature
```

## 🔧 Components

### AdminRoute
Protected route component that ensures only authenticated admin users can access admin pages.

**Usage:**
```jsx
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

### AdminLayout
Main layout component for the admin panel featuring:
- Collapsible sidebar with navigation
- Top bar with user info
- Responsive design for mobile/desktop
- Logout functionality

### StatsCard
Reusable statistics card component for the dashboard with:
- Animated loading states
- Customizable colors and icons
- Trend indicators (+ or -)
- Hover effects

## 📄 Pages

### AdminLogin
- Admin authentication page
- Form validation
- Password visibility toggle
- Remember me functionality
- Auto-redirect if already authenticated

**Route:** `/admin/login`

### AdminDashboard
- Overview statistics (Total Users, Active Users, New This Month, etc.)
- Recent activity feed
- User statistics by role (Students, Institutions, Admins)
- Growth rate indicators

**Route:** `/admin/dashboard`

### AdminUsers
- Complete user management interface
- Search and filter functionality
- Bulk operations (delete multiple users)
- User actions: View, Edit, Block/Unblock, Delete
- Pagination for large datasets
- Export users to CSV

**Route:** `/admin/users`

## 🔐 Context

### AdminContext
Global state management for admin authentication:

**Provided Values:**
- `adminUser`: Current logged-in admin user object
- `token`: JWT authentication token
- `isLoading`: Loading state during auth operations
- `login(credentials)`: Login method
- `logout()`: Logout method
- `isAuthenticated()`: Check if user is logged in
- `isAdmin()`: Check if user has admin role
- `isSuperAdmin()`: Check if user has super_admin role

**Usage:**
```jsx
import { useAdmin } from './features/admin/context/AdminContext';

function MyComponent() {
  const { adminUser, login, logout, isAuthenticated } = useAdmin();
  // ... component logic
}
```

## 🌐 Services

### AdminService
Comprehensive API client for admin operations with 20+ methods:

**Authentication:**
- `login(credentials)` - Admin login

**Dashboard:**
- `getDashboardStats()` - Get dashboard statistics
- `getActivities(params)` - Get activity logs

**User Management:**
- `getAllUsers(params)` - Get paginated user list
- `getUserById(id)` - Get single user details
- `createUser(userData)` - Create new user
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete single user
- `bulkDeleteUsers(ids)` - Delete multiple users
- `exportUsers(filters)` - Export users to CSV
- `blockUser(id)` - Block a user
- `unblockUser(id)` - Unblock a user
- `updateUserRole(id, role)` - Change user role
- `updateUserStatus(id, status)` - Change user status

**And many more...**

## 🎯 Import Patterns

### Option 1: Direct Import (Recommended for clarity)
```jsx
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import { useAdmin } from './features/admin/context/AdminContext';
import AdminService from './features/admin/services/adminService';
```

### Option 2: Barrel Imports (Cleaner but less explicit)
```jsx
import { AdminLogin, AdminDashboard } from './features/admin/pages';
import { useAdmin, AdminProvider } from './features/admin/context';
import { AdminService } from './features/admin/services';
```

### Option 3: Feature-level Import (Most concise)
```jsx
import { 
  AdminLogin, 
  AdminDashboard, 
  useAdmin, 
  AdminService 
} from './features/admin';
```

## 🔄 Migration from Old Structure

The admin code has been refactored from scattered locations into this organized structure:

**Old Locations → New Locations:**
- `src/services/adminService.js` → `src/features/admin/services/adminService.js`
- `src/context/AdminContext.js` → `src/features/admin/context/AdminContext.js`
- `src/components/AdminRoute.js` → `src/features/admin/components/AdminRoute.js`
- `src/components/AdminLayout.js` → `src/features/admin/components/AdminLayout.js`
- `src/components/admin/StatsCard.js` → `src/features/admin/components/StatsCard.js`
- `src/pages/AdminLogin.js` → `src/features/admin/pages/AdminLogin.js`
- `src/pages/AdminDashboard.js` → `src/features/admin/pages/AdminDashboard.js`
- `src/pages/AdminUsers.js` → `src/features/admin/pages/AdminUsers.js`

**Import Path Updates in App.js:**
```diff
- import AdminLogin from './pages/AdminLogin';
+ import AdminLogin from './features/admin/pages/AdminLogin';

- import { AdminProvider } from './context/AdminContext';
+ import { AdminProvider } from './features/admin/context/AdminContext';
```

## ✅ Benefits of This Structure

1. **Clear Organization**: All admin code is in one place
2. **Easy to Find**: Feature-based structure makes code discovery intuitive
3. **Scalability**: Easy to add new admin features (just add files to appropriate folders)
4. **Maintainability**: Clear separation of concerns (components, pages, services, context)
5. **Reusability**: Barrel exports make importing clean and consistent
6. **Isolated**: Admin code doesn't mix with main app code

## 📝 Adding New Admin Features

To add a new admin page or component:

1. **Create the file** in the appropriate folder (components/pages/services)
2. **Add to barrel export** in the folder's `index.js`
3. **Update routes** in `App.js` if it's a new page
4. **Update this README** with the new feature

Example - Adding "AdminReports" page:
```bash
# 1. Create the file
src/features/admin/pages/AdminReports.js

# 2. Add to pages/index.js
export { default as AdminReports } from './AdminReports';

# 3. Import in App.js and add route
import AdminReports from './features/admin/pages/AdminReports';
<Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
```

## 🔗 Related Documentation

- **Backend API**: See `/backend/ADMIN_API_DOCS.md` for API endpoints
- **Testing Guide**: See `/TESTING_GUIDE.md` for admin testing procedures
- **Login Guide**: See `/ADMIN_LOGIN_GUIDE.md` for admin credentials

## 👤 Admin Credentials (Development)

```
Email: admin@example.com
Password: Admin123456
```

**Note:** Change these credentials in production!

---

**Last Updated:** December 2024
**Maintained By:** Development Team
