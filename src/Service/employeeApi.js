import { baseApi } from './baseApi';

/**
 * Employee Management & Workforce Intelligence Service Module
 */
export const employeeApi = {
  /**
   * Fetch employee directory with search, filter, and pagination
   * @param {Object} params - { search, department, status, role, type, page, limit, sortBy, sortOrder }
   */
  getEmployees: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.role && params.role !== 'All') query.append('role', params.role);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const qs = query.toString();
    return baseApi.get(`/employees${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get single employee profile by MongoDB _id or company employeeId
   * @param {String} id
   */
  getEmployeeById: async (id) => {
    return baseApi.get(`/employees/${id}`);
  },

  /**
   * Get aggregated workforce KPIs & department distributions
   */
  getStats: async () => {
    return baseApi.get('/employees/stats');
  },

  /**
   * Get distinct list of all departments
   */
  getDepartments: async () => {
    return baseApi.get('/employees/departments');
  },

  /**
   * Create new employee profile and auto-provision user account
   * @param {Object} employeeData
   */
  createEmployee: async (employeeData) => {
    return baseApi.post('/employees', employeeData);
  },

  /**
   * Update existing employee profile
   * @param {String} id
   * @param {Object} employeeData
   */
  updateEmployee: async (id, employeeData) => {
    return baseApi.put(`/employees/${id}`, employeeData);
  },

  /**
   * Delete employee profile and associated user account
   * @param {String} id
   */
  deleteEmployee: async (id) => {
    return baseApi.delete(`/employees/${id}`);
  },
};

export default employeeApi;
