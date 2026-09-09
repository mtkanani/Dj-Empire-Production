import { api } from '../api.js';

const eventDetailsCache = new Map();
let categoriesCache = null;
let citiesCache = null;
let taxSettingsCache = null;
let taxSettingsInflight = null;

export const customerEventService = {
  browseEvents: (params = {}) => api.get('/customer/events', { params: { limit: 24, ...params } }),

  getEventDetails: (id) => {
    if (eventDetailsCache.has(id)) {
      return Promise.resolve(eventDetailsCache.get(id));
    }
    return api.get(`/customer/events/${id}`).then((res) => {
      eventDetailsCache.set(id, res);
      return res;
    });
  },

  prefetchEventDetails: (id) => {
    if (!id || eventDetailsCache.has(id)) return;
    customerEventService.getEventDetails(id).catch(() => {});
  },

  peekEventDetails: (id) => eventDetailsCache.get(id) || null,

  getCategories: () => {
    if (categoriesCache) return Promise.resolve(categoriesCache);
    return api.get('/customer/categories').then((res) => {
      categoriesCache = res;
      return res;
    });
  },

  getCities: () => {
    if (citiesCache) return Promise.resolve(citiesCache);
    return api.get('/customer/cities').then((res) => {
      citiesCache = res;
      return res;
    });
  },

  getTaxSettings: () => {
    if (taxSettingsCache) return Promise.resolve(taxSettingsCache);
    if (taxSettingsInflight) return taxSettingsInflight;
    taxSettingsInflight = api
      .get('/customer/tax-settings')
      .then((res) => {
        taxSettingsCache = res;
        return res;
      })
      .finally(() => {
        taxSettingsInflight = null;
      });
    return taxSettingsInflight;
  },
};
