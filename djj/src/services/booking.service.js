import { axiosInstance } from '../api/axiosInstance.js';

export const bookingService = {
  createBooking: async (bookingData) => {
    return axiosInstance.post('/bookings', bookingData);
  },
  getBookingDetails: async (bookingId) => {
    return axiosInstance.get(`/bookings/${bookingId}`);
  },
  getCustomerBookings: async () => {
    return axiosInstance.get('/customer/bookings');
  },
};
