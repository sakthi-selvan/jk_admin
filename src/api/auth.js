import apiClient from './client';

export const authAPI = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/admin/login', {
      username,
      password,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
};
