import { baseApi } from './baseApi';

/**
 * Authentication & Identity Service Module
 */
export const authApi = {
  /**
   * Role-based user login
   * @param {Object} credentials - { email, password, role? }
   */
  login: async (credentials) => {
    return baseApi.post('/auth/login', credentials);
  },

  /**
   * Terminate active user session
   */
  logout: async () => {
    try {
      await baseApi.post('/auth/logout', {});
    } catch (e) {
      console.warn('Backend session logout notification:', e.message);
    } finally {
      localStorage.removeItem('gotech_hrms_token');
      localStorage.removeItem('gotech_hrms_user');
    }
    return { success: true };
  },

  /**
   * Request OTP verification code for password reset
   * @param {String} email
   */
  forgotPassword: async (email) => {
    return baseApi.post('/auth/forgot-password', { email });
  },

  /**
   * Verify 6-digit OTP code
   * @param {String} email
   * @param {String} otp
   */
  verifyOtp: async (email, otp) => {
    return baseApi.post('/auth/verify-otp', { email, otp });
  },

  /**
   * Reset account password with verified OTP
   * @param {String} email
   * @param {String} otp
   * @param {String} newPassword
   */
  resetPassword: async (email, otp, newPassword) => {
    return baseApi.post('/auth/reset-password', { email, otp, newPassword });
  },

  /**
   * Get current authenticated user profile
   */
  getMe: async () => {
    return baseApi.get('/auth/me');
  },

  /**
   * Update password for currently authenticated user
   * @param {String} currentPassword
   * @param {String} newPassword
   */
  changePassword: async (currentPassword, newPassword) => {
    return baseApi.put('/auth/change-password', { currentPassword, newPassword });
  },
};

export default authApi;
