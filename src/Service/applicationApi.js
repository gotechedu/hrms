import { baseApi } from './baseApi';

/**
 * Talent & Candidate Applications Service Module
 */
export const applicationApi = {
  getJobApplications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.stage && params.stage !== 'All') query.append('stage', params.stage);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return baseApi.get(`/job-applications${qs ? `?${qs}` : ''}`);
  },

  getJobApplicationById: async (id) => {
    return baseApi.get(`/job-applications/${id}`);
  },

  submitJobApplication: async (applicationData) => {
    return baseApi.post('/job-applications', applicationData);
  },

  updateJobApplicationStage: async (id, stageData) => {
    return baseApi.put(`/job-applications/${id}`, stageData);
  },

  deleteJobApplication: async (id) => {
    return baseApi.delete(`/job-applications/${id}`);
  },
};

export default applicationApi;
