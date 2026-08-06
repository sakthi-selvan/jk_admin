import apiClient from './client';

const V2 = '/v2/admin/admin';

export const adminAPI = {
  // Legacy totals (users/drivers counts)
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Analytics (enhanced rides)
  getAnalyticsOverview: async (days = 7) => {
    const response = await apiClient.get(`${V2}/analytics/overview`, { params: { days } });
    return response.data;
  },

  getHourlyDistribution: async (days = 7) => {
    const response = await apiClient.get(`${V2}/analytics/hourly-distribution`, { params: { days } });
    return response.data;
  },

  getTripTypeAnalytics: async (days = 7) => {
    const response = await apiClient.get(`${V2}/analytics/trip-types`, { params: { days } });
    return response.data;
  },

  getVehicleCategoryAnalytics: async (days = 7) => {
    const response = await apiClient.get(`${V2}/analytics/vehicle-categories`, { params: { days } });
    return response.data;
  },

  getRevenueForecast: async () => {
    const response = await apiClient.get(`${V2}/analytics/revenue-forecast`);
    return response.data;
  },

  getRecentRides: async ({ limit = 50, status } = {}) => {
    const response = await apiClient.get(`${V2}/rides/recent`, {
      params: {
        limit,
        ...(status ? { status_filter: status } : {}),
      },
    });
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

  // Rides (legacy list fallback)
  getRides: async () => {
    const response = await apiClient.get('/admin/rides');
    return response.data;
  },

  getRide: async (rideId) => {
    const response = await apiClient.get(`/admin/rides/${rideId}`);
    return response.data;
  },

  getDriverEarnings: async () => {
    const response = await apiClient.get(`${V2}/drivers/earnings`);
    return response.data;
  },

  getActiveRides: async () => {
    const response = await apiClient.get('/admin/rides/active');
    return response.data;
  },

  getOnlineDrivers: async () => {
    const response = await apiClient.get('/admin/drivers/online');
    return response.data;
  },

  getVehicleCategories: async (includeInactive = true) => {
    const response = await apiClient.get(`${V2}/vehicle-categories`, {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  },

  createVehicleCategory: async (data) => {
    const response = await apiClient.post(`${V2}/vehicle-categories`, data);
    return response.data;
  },

  updateVehicleCategory: async (categoryId, data) => {
    const response = await apiClient.put(`${V2}/vehicle-categories/${categoryId}`, data);
    return response.data;
  },

  deactivateVehicleCategory: async (categoryId) => {
    const response = await apiClient.delete(`${V2}/vehicle-categories/${categoryId}`);
    return response.data;
  },
};
