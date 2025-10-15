import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleProtectedRoute({ children, role }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Debug user data in detail
  console.log('Full user data:', user);
  
  // Show loading state
  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  // If not authenticated at all, redirect to login
  if (!isAuthenticated || !user) {
    const currentPath = window.location.pathname;
    console.log('Not authenticated, redirecting to login. Current path:', currentPath);
    return <Navigate to="/login" state={{ from: currentPath }} replace />;
  }

  // Get user role - make sure we're accessing the correct path
  let userRole = null;
  
  // Try to get role from academicInfo
  if (user.academicInfo && typeof user.academicInfo === 'object') {
    userRole = user.academicInfo.role;
  }
  
  // If role wasn't found in academicInfo, try direct role property
  if (!userRole && user.role) {
    userRole = user.role;
  }

  console.log('Role check:', {
    userRole,
    requiredRole: role,
    hasAcademicInfo: !!user.academicInfo,
    academicInfo: user.academicInfo,
    directRole: user.role
  });

  if (role && userRole !== role) {
    console.log('Role mismatch:', {
      required: role,
      current: userRole,
      userData: user
    });
    return <Navigate to="/" replace />;
  }

  console.log('Access granted to protected route');
  return children;
}
