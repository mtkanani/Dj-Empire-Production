import { api } from '../api.js';

/**
 * Customer Management Service
 * Wraps all /admin/customers/* backend endpoints.
 *
 * Verified against backend admin.route.js, admin.controller.js,
 * admin.service.js, and admin.repository.js.
 *
 * AVAILABLE BACKEND APIS:
 *   GET    /admin/customers          → getAllCustomers()
 *   GET    /admin/customers/:id      → getCustomerById(id)
 *   PATCH  /admin/customers/:id/suspend   → suspendCustomer(id)
 *   PATCH  /admin/customers/:id/activate  → activateCustomer(id)
 *
 * MISSING BACKEND APIS (not implemented):
 *   - Permanent customer deletion (no DELETE endpoint)
 *   - Customer activity / audit log endpoint
 *   - Server-side search / filter / pagination params
 */
export const customerService = {
  /**
   * List all registered customers.
   * List response shape: { success, data: [...] }
   * Each item: { id, email, firstName, lastName, phone, status, createdAt, _count: { bookings } }
   */
  getCustomers: async () => {
    return api.get('/admin/customers');
  },

  /**
   * Get full customer details including booking history.
   * Response shape: { success, data: user }
   * user includes: bookings[].{ event: { venue, city }, tickets[].{ ticketType } }
   */
  getCustomerById: async (id) => {
    return api.get(`/admin/customers/${id}`);
  },

  /**
   * Suspend a customer account.
   * Revokes all active sessions.
   * Response: { success, message }
   */
  suspendCustomer: async (id) => {
    return api.patch(`/admin/customers/${id}/suspend`);
  },

  /**
   * Re-activate a suspended customer account.
   * Sets status back to ACTIVE.
   * Response: { success, message }
   */
  activateCustomer: async (id) => {
    return api.patch(`/admin/customers/${id}/activate`);
  },
};
