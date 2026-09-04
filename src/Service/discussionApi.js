import { baseApi } from './baseApi';

/**
 * Team Discussions API Service
 */
export const discussionApi = {
  getDiscussions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString();
    return baseApi.get(`/discussions${qs ? `?${qs}` : ''}`);
  },

  getStats: async () => {
    return baseApi.get('/discussions/stats');
  },

  getDiscussionById: async (id) => {
    return baseApi.get(`/discussions/${id}`);
  },

  createDiscussion: async (data) => {
    return baseApi.post('/discussions', data);
  },

  updateDiscussion: async (id, data) => {
    return baseApi.put(`/discussions/${id}`, data);
  },

  deleteDiscussion: async (id) => {
    return baseApi.delete(`/discussions/${id}`);
  },

  addReply: async (id, content) => {
    return baseApi.post(`/discussions/${id}/replies`, { content });
  },

  toggleLike: async (id) => {
    return baseApi.post(`/discussions/${id}/like`);
  },
};

export default discussionApi;
