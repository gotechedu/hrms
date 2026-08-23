import { baseApi } from './baseApi';

/**
 * Company Blogs & Publications Service Module
 */
export const blogApi = {
  getBlogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return baseApi.get(`/blogs${qs ? `?${qs}` : ''}`);
  },

  getBlogBySlugOrId: async (slugOrId) => {
    return baseApi.get(`/blogs/${slugOrId}`);
  },

  createBlog: async (blogData) => {
    return baseApi.post('/blogs', blogData);
  },

  updateBlog: async (id, blogData) => {
    return baseApi.put(`/blogs/${id}`, blogData);
  },

  deleteBlog: async (id) => {
    return baseApi.delete(`/blogs/${id}`);
  },
};

export default blogApi;
