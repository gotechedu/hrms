import { baseApi } from './baseApi';

/**
 * Enterprise Attendance & Leave Telemetry Service
 */
export const attendanceApi = {
  // Clock in currently authenticated employee
  clockIn: async () => {
    return baseApi.post('/attendance/clock-in');
  },

  // Clock out currently authenticated employee
  clockOut: async () => {
    return baseApi.post('/attendance/clock-out');
  },

  // Get current day's punch status and worked duration
  getTodayStatus: async () => {
    return baseApi.get('/attendance/today');
  },

  // Get personal attendance logs history
  getMyAttendance: async () => {
    return baseApi.get('/attendance/my');
  },

  // Get organization-wide attendance roster (Admin, HR, Manager)
  getAllAttendance: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return baseApi.get(`/attendance${queryString}`);
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    return baseApi.post('/attendance/leave', leaveData);
  },

  // Get leave applications list
  getLeaveRequests: async () => {
    return baseApi.get('/attendance/leaves');
  },

  // Approve or Reject leave application
  updateLeaveStatus: async (id, status) => {
    return baseApi.put(`/attendance/leaves/${id}`, { status });
  },
};

export default attendanceApi;
