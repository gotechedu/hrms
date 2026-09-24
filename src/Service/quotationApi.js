import { baseApi } from './baseApi';

/**
 * Commercial & Educational Quotation Service
 */
export const quotationApi = {
  // Send a new quotation via email
  sendQuotation: async (payload) => {
    return baseApi.post('/quotations/send', payload);
  },

  // Get quotations for a specific inquiry
  getQuotationsByInquiry: async (inquiryId) => {
    return baseApi.get(`/quotations/inquiry/${inquiryId}`);
  },

  // Get all quotations with filters
  getAllQuotations: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/quotations${qs ? `?${qs}` : ''}`);
  },

  // Public endpoint - get quotation document for viewing
  getPublicQuotation: async (id) => {
    return baseApi.get(`/quotations/public/${id}`);
  },

  // Public endpoint - submit registration details and UPI UTR
  submitQuotationRegistration: async (id, payload) => {
    return baseApi.post(`/quotations/public/${id}/register`, payload);
  },

  // Protected endpoint - verify quotation payment and activate student enrollment
  verifyQuotation: async (id) => {
    return baseApi.post(`/quotations/${id}/verify`, {});
  },
};

export default quotationApi;
