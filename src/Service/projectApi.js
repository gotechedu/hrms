import { baseApi } from './baseApi';

export const projectApi = {
  getProjects: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/projects${qs ? `?${qs}` : ''}`);
  },

  getProjectById: async (id) => {
    return baseApi.get(`/projects/${id}`);
  },

  createProject: async (projectData) => {
    return baseApi.post('/projects', projectData);
  },

  updateProject: async (id, projectData) => {
    return baseApi.put(`/projects/${id}`, projectData);
  },

  updateProjectProgress: async (id, progressData) => {
    return baseApi.patch(`/projects/${id}/progress`, progressData);
  },

  deleteProject: async (id) => {
    return baseApi.delete(`/projects/${id}`);
  },
};

export default projectApi;
