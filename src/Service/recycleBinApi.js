import { baseApi } from './baseApi';

/**
 * Universal Recycle Bin API Service
 */
export const recycleBinApi = {
  // Get all deleted items
  getDeletedItems: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return baseApi.get(`/recycle-bin${qs ? `?${qs}` : ''}`);
  },

  // Restore deleted item
  restoreItem: async (type, id) => {
    return baseApi.post(`/recycle-bin/restore/${type}/${id}`);
  },

  // Permanently delete item
  permanentDelete: async (type, id) => {
    return baseApi.delete(`/recycle-bin/permanent/${type}/${id}`);
  },

  // Empty entire recycle bin
  emptyRecycleBin: async () => {
    return baseApi.delete('/recycle-bin/empty');
  },
};

export default recycleBinApi;
