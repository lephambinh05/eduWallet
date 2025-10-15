import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../../src/services/auth';

export default function RoleProtectedRoute({ children, role }) {
  const user = getCurrentUser && getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
