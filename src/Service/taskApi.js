import { baseApi } from './baseApi';

export const taskApi = {
  getTasks: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.project) query.append('project', params.project);
    if (params.assignee) query.append('assignee', params.assignee);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/tasks${qs ? `?${qs}` : ''}`);
  },

  getTaskById: async (id) => {
    return baseApi.get(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return baseApi.post('/tasks', taskData);
  },

  updateTask: async (id, taskData) => {
    return baseApi.put(`/tasks/${id}`, taskData);
  },

  updateTaskStatus: async (id, statusData) => {
    return baseApi.patch(`/tasks/${id}/status`, statusData);
  },

  deleteTask: async (id) => {
    return baseApi.delete(`/tasks/${id}`);
  },
};

export default taskApi;
