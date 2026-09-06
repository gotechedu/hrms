import { baseApi } from './baseApi';

export const policyApi = {
  getPolicies: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.scope && params.scope !== 'All') query.append('scope', params.scope);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/policies${qs ? `?${qs}` : ''}`);
  },

  getPolicyById: async (id) => {
    return baseApi.get(`/policies/${id}`);
  },

  createPolicy: async (policyData) => {
    return baseApi.post('/policies', policyData);
  },

  updatePolicy: async (id, policyData) => {
    return baseApi.put(`/policies/${id}`, policyData);
  },

  deletePolicy: async (id) => {
    return baseApi.delete(`/policies/${id}`);
  },

  acknowledgePolicy: async (id, payload = {}) => {
    return baseApi.post(`/policies/${id}/acknowledge`, payload);
  },
};

export default policyApi;
