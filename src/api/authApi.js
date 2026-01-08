import api from './blogApi';

export const authApi = {
  // Register new user
  register: (userData) => 
    api.post('/auth/register', userData),

  // Login user
  login: (credentials) => 
    api.post('/auth/login', credentials),

  // Get current user profile
  getProfile: () => 
    api.get('/auth/profile'),

  // Update profile
  updateProfile: (userData) => 
    api.put('/auth/profile', userData),

  // Change password
  changePassword: (passwordData) => 
    api.put('/auth/change-password', passwordData),

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};