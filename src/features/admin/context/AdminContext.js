import React, { createContext, useState, useContext, useEffect } from 'react';
import AdminService from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setAdminUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AdminService.login(credentials);
      console.log('AdminContext - API Response:', response); // Debug log
      
      if (response.success) {
        const { user, accessToken } = response.data;
        const token = accessToken; // Backend returns 'accessToken', not 'token'
        console.log('AdminContext - User:', user); // Debug log
        console.log('AdminContext - Token:', token); // Debug log
        console.log('AdminContext - Token type:', typeof token); // Debug log
        console.log('AdminContext - Token length:', token?.length); // Debug log
        
        // Check if user is admin
        if (!['admin', 'super_admin'].includes(user.role)) {
          toast.error('Access denied. Admin privileges required.');
          return { success: false, message: 'Not authorized' };
        }

        // Save to localStorage FIRST
        console.log('AdminContext - Saving to localStorage...'); // Debug log
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Verify save
        const savedToken = localStorage.getItem('adminToken');
        const savedUser = localStorage.getItem('adminUser');
        console.log('AdminContext - Token saved successfully:', !!savedToken); // Debug log
        console.log('AdminContext - Token preview:', savedToken?.substring(0, 30) + '...'); // Debug log
        console.log('AdminContext - User saved successfully:', !!savedUser); // Debug log
        
        // Then update state
        setToken(token);
        setAdminUser(user);
        
        toast.success(`Welcome back, ${user.username}!`);
        console.log('AdminContext - Login successful, returning success'); // Debug log
        return { success: true, user, token };
      }
      
      console.log('AdminContext - Response not successful:', response); // Debug log
      return response;
    } catch (error) {
      console.error('AdminContext - Login error:', error); // Debug log
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    AdminService.logout();
    setToken(null);
    setAdminUser(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = () => {
    return !!token && !!adminUser;
  };

  const isAdmin = () => {
    return adminUser && ['admin', 'super_admin'].includes(adminUser.role);
  };

  const isSuperAdmin = () => {
    return adminUser && adminUser.role === 'super_admin';
  };

  const value = {
    adminUser,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
