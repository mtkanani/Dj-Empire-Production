import { axiosInstance } from '../api/axiosInstance.js';

export const adminService = {
  getTaxSettings: async () => {
    return axiosInstance.get('/admin/tax-settings');
  },
  updateTaxSettings: async (settings) => {
    return axiosInstance.post('/admin/tax-settings', settings);
  },
  getPendingOrganizers: async () => {
    return axiosInstance.get('/admin/organizers/pending');
  },
  approveOrganizer: async (organizerId) => {
    return axiosInstance.patch(`/admin/organizers/${organizerId}/approve`);
  },
};
