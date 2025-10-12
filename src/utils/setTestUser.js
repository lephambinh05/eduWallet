// Script to set test user for development
import { saveUserToLocalStorage } from './userUtils';

export const setTestUser = () => {
  const testUser = {
    id: 'u001',
    email: 'lephambinh05@gmail.com',
    firstName: 'Lê Phạm',
    lastName: 'Bình',
    username: 'lephambinhdz',
    name: 'Lê Phạm Bình',
    studentId: 'SV2024001',
    dateOfBirth: '2000-05-15',
    phone: '0123456789',
    role: 'student',
    isActive: true,
    isEmailVerified: true,
    institution: 'Trường Đại học Ngoại Ngữ - Tin Học',
    major: 'Công nghệ thông tin',
    gpa: 3.8,
    academicYear: '2024-2025',
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token'
  };

  saveUserToLocalStorage(testUser);
  console.log('Test user set:', testUser);
  return testUser;
};

// Auto-set test user in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-set test user
  // setTestUser();
}
