import { baseApi } from './baseApi';

/**
 * Enterprise Settings & Permissions API Service
 */
export const settingsApi = {
  // Get system settings
  getSettings: async () => {
    return baseApi.get('/settings');
  },

  // Update system settings
  updateSettings: async (settingsData) => {
    return baseApi.put('/settings', settingsData);
  },

  // Update role permissions matrix
  updatePermissions: async (rolesPermissions) => {
    return baseApi.put('/settings/permissions', { rolesPermissions });
  },
};

export default settingsApi;
