import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import permissionUtils, {
  hasPermission as checkHasPermission,
  hasAnyPermission as checkHasAnyPermission,
  hasAllPermissions as checkHasAllPermissions,
  can as checkCan,
  isSuperAdmin as checkIsSuperAdmin,
  getUserRole,
  getUserPermissions,
} from './permissionUtils';

/**
 * Custom React hook for dynamic permission and role management in UI components
 * Automatically extracts the authenticated user from Redux auth state unless an override user is passed.
 *
 * @param {Object} [overrideUser] - Optional user object to check against instead of current auth user
 * @returns {Object} Permission checker utilities, roles, and status flags
 */
export function usePermissions(overrideUser) {
  const authUser = useSelector((state) => state.auth?.user);
  const user = overrideUser || authUser;

  return useMemo(() => {
    const role = getUserRole(user);
    const isSuper = checkIsSuperAdmin(user);
    const permissions = getUserPermissions(user);

    return {
      user,
      role,
      permissions,
      isSuperAdmin: isSuper,

      // Universal checks
      hasPermission: (permission) => checkHasPermission(user, permission),
      hasAnyPermission: (perms) => checkHasAnyPermission(user, perms),
      hasAllPermissions: (perms) => checkHasAllPermissions(user, perms),
      can: (action, feature, context) => checkCan(user, action, feature, context),

      // Project permissions
      canViewProject: () => permissionUtils.canViewProject(user),
      canAddProject: () => permissionUtils.canAddProject(user),
      canEditProject: (project) => permissionUtils.canEditProject(user, project),
      canDeleteProject: (project) => permissionUtils.canDeleteProject(user, project),
      canManageProject: () => permissionUtils.canManageProject(user),

      // Attendance permissions
      canViewAttendance: (context) => permissionUtils.canViewAttendance(user, context),
      canAddAttendance: (context) => permissionUtils.canAddAttendance(user, context),
      canPunchAttendance: (context) => permissionUtils.canPunchAttendance(user, context),
      canEditAttendance: () => permissionUtils.canEditAttendance(user),
      canDeleteAttendance: () => permissionUtils.canDeleteAttendance(user),
      canManageAttendance: () => permissionUtils.canManageAttendance(user),

      // Employee permissions
      canViewEmployee: () => permissionUtils.canViewEmployee(user),
      canAddEmployee: () => permissionUtils.canAddEmployee(user),
      canEditEmployee: () => permissionUtils.canEditEmployee(user),
      canDeleteEmployee: () => permissionUtils.canDeleteEmployee(user),
      canManageEmployee: () => permissionUtils.canManageEmployee(user),

      // Other features
      canViewTask: () => permissionUtils.canViewTask(user),
      canAddTask: () => permissionUtils.canAddTask(user),
      canManageTask: () => permissionUtils.canManageTask(user),
      canViewTimesheet: () => permissionUtils.canViewTimesheet(user),
      canManageTimesheet: () => permissionUtils.canManageTimesheet(user),
      canManageBlogs: () => permissionUtils.canManageBlogs(user),
      canManageCareer: () => permissionUtils.canManageCareer(user),
      canManageHoliday: () => permissionUtils.canManageHoliday(user),
      canViewLearningHub: () => permissionUtils.canViewLearningHub(user),
      canManageLearningHub: () => permissionUtils.canManageLearningHub(user),
    };
  }, [user]);
}

/**
 * <Can> Component for declarative conditional rendering based on user permissions
 *
 * Usage Examples:
 *   <Can do="add" on="project">
 *     <button>Create New Project</button>
 *   </Can>
 *
 *   <Can do="delete" on="project" fallback={<span className="text-gray-400">Locked</span>}>
 *     <button onClick={handleDelete}>Delete Project</button>
 *   </Can>
 *
 *   <Can permission="manage_employee">
 *     <EmployeeAdminPanel />
 *   </Can>
 *
 *   <Can any={['manage_attendance', 'manage_timesheet']}>
 *     <RosterReport />
 *   </Can>
 */
export function Can({
  do: action,
  on: feature,
  permission,
  any: anyPermissions,
  all: allPermissions,
  role: requiredRole,
  fallback = null,
  context = {},
  user: userOverride,
  children,
}) {
  const { user: hookUser, can, hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin, role } =
    usePermissions(userOverride);

  // If no authenticated user, render fallback
  if (!hookUser) return fallback;

  // Superadmin bypasses all guards
  if (isSuperAdmin) return <>{children}</>;

  // 1. Role guard
  if (requiredRole) {
    const roles = Array.isArray(requiredRole)
      ? requiredRole.map((r) => String(r).toLowerCase().trim())
      : [String(requiredRole).toLowerCase().trim()];
    if (!roles.includes(role)) {
      return fallback;
    }
  }

  // 2. Action + Feature guard (e.g. do="add" on="project")
  if (action && feature) {
    if (!can(action, feature, context)) {
      return fallback;
    }
  }

  // 3. Single permission guard (e.g. permission="create_employee")
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback;
    }
  }

  // 4. Any permission guard (e.g. any={['manage_project', 'manage_task']})
  if (anyPermissions && anyPermissions.length > 0) {
    if (!hasAnyPermission(anyPermissions)) {
      return fallback;
    }
  }

  // 5. All permissions guard
  if (allPermissions && allPermissions.length > 0) {
    if (!hasAllPermissions(allPermissions)) {
      return fallback;
    }
  }

  return <>{children}</>;
}

export default usePermissions;
