import { baseApi } from './baseApi';

/**
 * Enterprise Payroll API Service
 * Handles Org Employees, Students / Interns, and IT Solution Contractors
 */
export const payrollApi = {
  // Get payroll records with filters
  getPayrolls: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.month && params.month !== 'All') query.append('month', params.month);
    if (params.year && params.year !== 'All') query.append('year', params.year);
    if (params.paymentStatus && params.paymentStatus !== 'All') query.append('paymentStatus', params.paymentStatus);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    return baseApi.get(`/payroll${qs ? `?${qs}` : ''}`);
  },

  // Get aggregated payroll statistics
  getPayrollStats: async () => {
    return baseApi.get('/payroll/stats');
  },

  // Get single payroll record
  getPayrollById: async (id) => {
    return baseApi.get(`/payroll/${id}`);
  },

  // Create new payroll record
  createPayroll: async (payrollData) => {
    return baseApi.post('/payroll', payrollData);
  },

  // Update existing payroll record
  updatePayroll: async (id, payrollData) => {
    return baseApi.put(`/payroll/${id}`, payrollData);
  },

  // Update payment status (Paid, Processing, Pending)
  updatePaymentStatus: async (id, statusData) => {
    return baseApi.patch(`/payroll/${id}/status`, statusData);
  },

  // Soft delete payroll record (moves to Recycle Bin)
  deletePayroll: async (id) => {
    return baseApi.delete(`/payroll/${id}`);
  },
};

export default payrollApi;
