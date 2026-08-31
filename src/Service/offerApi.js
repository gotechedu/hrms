import { baseApi } from './baseApi';

/**
 * Offers & Coupons Service Module
 */
export const offerApi = {
  getOffers: async () => {
    return baseApi.get('/offers');
  },

  getPortalPopupOffer: async () => {
    return baseApi.get('/offers/portal-popup');
  },

  createOffer: async (offerData) => {
    return baseApi.post('/offers', offerData);
  },

  updateOffer: async (id, offerData) => {
    return baseApi.put(`/offers/${id}`, offerData);
  },

  deleteOffer: async (id) => {
    return baseApi.delete(`/offers/${id}`);
  },

  validateCoupon: async (payload) => {
    return baseApi.post('/offers/validate', payload);
  },
};

export default offerApi;
