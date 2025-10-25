import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading, adminUser, token } = useAdmin();

  console.log('AdminRoute - Check:', { 
    isLoading, 
    isAuthenticated: isAuthenticated(), 
    isAdmin: isAdmin(),
    hasToken: !!token,
    hasUser: !!adminUser,
    userRole: adminUser?.role
  });

  if (isLoading) {
    console.log('AdminRoute - Still loading...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated() || !isAdmin()) {
    console.log('AdminRoute - Redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('AdminRoute - Access granted');
  return children;
};

export default AdminRoute;
