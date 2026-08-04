import apiClient from './client';

export const adminAPI = {
  // Dashboard stats
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  getUser: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await apiClient.put(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  // Drivers
  getDrivers: async () => {
    const response = await apiClient.get('/admin/drivers');
    return response.data;
  },

  getDriver: async (driverId) => {
    const response = await apiClient.get(`/admin/drivers/${driverId}`);
    return response.data;
  },

  blockDriver: async (driverId) => {
    const response = await apiClient.put(`/admin/drivers/${driverId}/block`);
    return response.data;
  },

  unblockDriver: async (driverId) => {
    const response = await apiClient.put(`/admin/drivers/${driverId}/unblock`);
    return response.data;
  },

  // Rides
  getRides: async () => {
    const response = await apiClient.get('/admin/rides');
    return response.data;
  },

  getRide: async (rideId) => {
    const response = await apiClient.get(`/admin/rides/${rideId}`);
    return response.data;
  },

  // Driver Earnings
  getDriverEarnings: async () => {
    const response = await apiClient.get('/v2/admin/admin/drivers/earnings');
    return response.data;
  },

  // Active Rides
  getActiveRides: async () => {
    const response = await apiClient.get('/admin/rides/active');
    return response.data;
  },

  // Online Drivers
  getOnlineDrivers: async () => {
    const response = await apiClient.get('/admin/drivers/online');
    return response.data;
  },
};
