import { axiosInstance } from '../api/axiosInstance.js';

export const eventService = {
  getEvents: async (params = {}) => {
    return axiosInstance.get('/events', { params });
  },
  getEventBySlug: async (slug) => {
    return axiosInstance.get(`/events/${slug}`);
  },
  getCategories: async () => {
    return axiosInstance.get('/event-categories');
  },
};
