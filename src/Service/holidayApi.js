import { baseApi } from './baseApi';

export const holidayApi = {
  getHolidays: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/holidays${qs ? `?${qs}` : ''}`);
  },

  createHoliday: async (holidayData) => {
    return baseApi.post('/holidays', holidayData);
  },

  updateHoliday: async (id, holidayData) => {
    return baseApi.put(`/holidays/${id}`, holidayData);
  },

  deleteHoliday: async (id) => {
    return baseApi.delete(`/holidays/${id}`);
  },
};

export default holidayApi;
