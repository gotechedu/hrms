import { baseApi } from './baseApi';

/**
 * Enterprise Roles & Permissions API Service
 */
export const rolePermissionApi = {
  // --- Roles Endpoints ---
  getRoles: async () => {
    return baseApi.get('/roles');
  },

  createRole: async (roleData) => {
    return baseApi.post('/roles', roleData);
  },

  getRoleById: async (id) => {
    return baseApi.get(`/roles/${id}`);
  },

  updateRole: async (id, roleData) => {
    return baseApi.put(`/roles/${id}`, roleData);
  },

  deleteRole: async (id) => {
    return baseApi.delete(`/roles/${id}`);
  },

  assignPermissionsToRole: async (roleId, permissions) => {
    return baseApi.put(`/roles/${roleId}/permissions`, { permissions });
  },

  // --- Permissions & Matrix Endpoints ---
  getPermissions: async () => {
    return baseApi.get('/permissions');
  },

  createPermission: async (permissionData) => {
    return baseApi.post('/permissions', permissionData);
  },

  getPermissionMatrix: async () => {
    return baseApi.get('/permissions/matrix');
  },

  updatePermissionMatrix: async (matrix) => {
    return baseApi.put('/permissions/matrix', { matrix });
  },
};

export default rolePermissionApi;
