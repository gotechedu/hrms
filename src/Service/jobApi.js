import { baseApi } from './baseApi';

/**
 * Job Postings & Career Service Module
 */
export const jobApi = {
  getJobs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return baseApi.get(`/jobs${qs ? `?${qs}` : ''}`);
  },

  getJobById: async (id) => {
    return baseApi.get(`/jobs/${id}`);
  },

  createJob: async (jobData) => {
    return baseApi.post('/jobs', jobData);
  },

  updateJob: async (id, jobData) => {
    return baseApi.put(`/jobs/${id}`, jobData);
  },

  deleteJob: async (id) => {
    return baseApi.delete(`/jobs/${id}`);
  },
};

export default jobApi;
