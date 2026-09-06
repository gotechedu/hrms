import { baseApi } from './baseApi';

export const grievanceApi = {
  getGrievances: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.severity && params.severity !== 'All') query.append('severity', params.severity);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/grievances${qs ? `?${qs}` : ''}`);
  },

  getGrievanceById: async (id) => {
    return baseApi.get(`/grievances/${id}`);
  },

  fileGrievance: async (grievanceData) => {
    return baseApi.post('/grievances', grievanceData);
  },

  updateArbitration: async (id, arbitrationData) => {
    return baseApi.put(`/grievances/${id}/arbitrate`, arbitrationData);
  },

  deleteGrievance: async (id) => {
    return baseApi.delete(`/grievances/${id}`);
  },
};

export default grievanceApi;
