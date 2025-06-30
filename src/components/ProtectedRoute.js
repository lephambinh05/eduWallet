import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/userUtils';

const ProtectedRoute = ({ children }) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 