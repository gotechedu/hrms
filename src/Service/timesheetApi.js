import { baseApi } from './baseApi';

/**
 * Enterprise Timesheet & Billable Hours Service
 */
export const timesheetApi = {
  // Create / submit new timesheet
  createTimesheet: async (data) => {
    return baseApi.post('/timesheets', data);
  },

  // Get personal timesheet submissions
  getMyTimesheets: async () => {
    return baseApi.get('/timesheets/my');
  },

  // Get organization timesheet roster (Manager, HR, Admin)
  getAllTimesheets: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.project) query.append('project', params.project);
    if (params.week) query.append('week', params.week);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return baseApi.get(`/timesheets${qs}`);
  },

  // Update draft / submitted timesheet
  updateTimesheet: async (id, data) => {
    return baseApi.put(`/timesheets/${id}`, data);
  },

  // Delete timesheet entry
  deleteTimesheet: async (id) => {
    return baseApi.delete(`/timesheets/${id}`);
  },

  // Update approval status (Approve / Reject)
  updateTimesheetStatus: async (id, status, remarks = '') => {
    return baseApi.put(`/timesheets/${id}/status`, { status, remarks });
  },
};

export default timesheetApi;
