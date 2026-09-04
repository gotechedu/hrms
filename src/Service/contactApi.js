import { baseApi } from './baseApi';

/**
 * Client Consultation & Contact Inquiries Service
 */
export const contactApi = {
  getInquiries: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.service && params.service !== 'All') query.append('service', params.service);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString();
    return baseApi.get(`/contacts${qs ? `?${qs}` : ''}`);
  },

  getStats: async () => {
    return baseApi.get('/contacts/stats');
  },

  getInquiryById: async (id) => {
    return baseApi.get(`/contacts/${id}`);
  },

  updateInquiry: async (id, data) => {
    return baseApi.put(`/contacts/${id}`, data);
  },

  createManualInquiry: async (data) => {
    return baseApi.post('/contacts/manual', data);
  },

  deleteInquiry: async (id, permanent = false) => {
    return baseApi.delete(`/contacts/${id}${permanent ? '?permanent=true' : ''}`);
  },
};

export default contactApi;
