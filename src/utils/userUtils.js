// Utility functions for user management
import usersData from '../data/users.json';

export const saveUserToLocalStorage = (user) => {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 tiếng
  localStorage.setItem('currentUser', JSON.stringify({ ...user, expiresAt }));
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    if (user.expiresAt && Date.now() > user.expiresAt) {
      // Hết hạn, tự động logout
      localStorage.removeItem('currentUser');
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

export const registerNewUser = (userData) => {
  // Generate new user ID
  const newUserId = `u${Date.now()}`;
  
  const newUser = {
    id: newUserId,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    name: userData.fullName,
    avatar: '/avatar1.png',
    wallet: '',
    learnPassId: '',
    balance: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };

  // Add to users array
  usersData.users.push(newUser);
  
  // Save to localStorage for demo
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
  existingUsers.push(newUser);
  localStorage.setItem('users', JSON.stringify(existingUsers));
  
  return newUser;
};

export const validateUser = (username, password) => {
  // Check in localStorage first (for newly registered users)
  const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const localUser = localUsers.find(u => u.username === username && u.password === password);
  
  if (localUser) {
    return localUser;
  }
  
  // Check in original data
  const user = usersData.users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const isUsernameTaken = (username) => {
  const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const localExists = localUsers.some(u => u.username === username);
  
  if (localExists) return true;
  
  return usersData.users.some(u => u.username === username);
};

export const isEmailTaken = (email) => {
  const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const localExists = localUsers.some(u => u.email === email);
  
  if (localExists) return true;
  
  return usersData.users.some(u => u.email === email);
}; 