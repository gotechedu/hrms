/**
 * Enterprise Role-Based Access Control (RBAC) & Feature Permission Utility
 *
 * Handles role-based access, granular feature permissions (add, edit, delete, view),
 * spelling variations (e.g. attendance vs attandance), dynamic new permissions,
 * and universal superadmin bypass.
 */

// ==========================================
// 1. DEFAULT ROLE PERMISSIONS MATRIX
// ==========================================
export const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: ['*'],
  admin: [
    'manage_employee', 'create_employee', 'update_employee', 'delete_employee', 'view_employee',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_project', 'add_project', 'create_project', 'update_project', 'assign_project', 'delete_project', 'view_project',
    'manage_task', 'add_task', 'assign_task', 'update_task', 'delete_task', 'view_task',
    'manage_holiday', 'add_holiday', 'view_holiday',
    'manage_payroll', 'view_payroll', 'export_payroll',
    'manage_learninghub', 'view_learninghub', 'manage_batches', 'manage_trainers', 'manage_classes', 'manage_attendance', 'manage_assignments', 'grade_submissions', 'manage_assessments', 'issue_certificates',
    'manage_career', 'manage_applications', 'view_career',
    'manage_contact', 'manage_contacts', 'view_contacts',
    'manage_blogs', 'view_blogs',
    'manage_discussions', 'view_discussions',
    'manage_policy', 'view_policy', 'manage_grievance', 'view_grievance',
    'manage_settings', 'manage_roles', 'manage_permissions',
    'manage_dashboard',
    'manage_recycle_bin', 'view_recycle_bin',
  ],
  hr: [
    'manage_employee', 'create_employee', 'update_employee', 'view_employee',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_holiday', 'add_holiday', 'view_holiday',
    'manage_career', 'manage_applications', 'view_career',
    'manage_payroll', 'view_payroll',
    'manage_blogs', 'view_blogs',
    'manage_policy', 'view_policy', 'manage_grievance', 'view_grievance',
    'manage_dashboard',
    'manage_task', 'add_task', 'update_task', 'view_task',
    'manage_contact', 'manage_contacts', 'view_contacts',
  ],
  manager: [
    'view_employee', 'update_employee',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_project', 'add_project', 'create_project', 'update_project', 'assign_project', 'view_project',
    'manage_task', 'add_task', 'assign_task', 'update_task', 'delete_task', 'view_task',
    'manage_holiday', 'view_holiday',
    'view_learninghub',
    'manage_blogs', 'view_blogs',
    'manage_discussions', 'view_discussions',
    'manage_dashboard',
  ],
  teamlead: [
    'view_employee',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_project', 'add_project', 'update_project', 'view_project',
    'manage_task', 'add_task', 'assign_task', 'update_task', 'view_task',
    'manage_holiday', 'view_holiday',
    'view_learninghub',
    'manage_discussions', 'view_discussions',
    'manage_dashboard',
  ],
  sales_manager: [
    'manage_project', 'add_project', 'create_project', 'update_project', 'view_project',
    'manage_contact', 'manage_contacts', 'view_contacts',
    'manage_task', 'add_task', 'update_task', 'view_task',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_holiday', 'view_holiday',
    'manage_dashboard',
    'view_blogs',
  ],
  development_manager: [
    'manage_project', 'add_project', 'create_project', 'update_project', 'assign_project', 'view_project',
    'manage_task', 'add_task', 'assign_task', 'update_task', 'view_task',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_holiday', 'view_holiday',
    'view_learninghub',
    'manage_dashboard',
  ],
  deployment_manager: [
    'manage_project', 'update_project', 'view_project',
    'manage_task', 'update_task', 'view_task',
    'manage_attendance', 'manage_attandance', 'view_attendance', 'add_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_holiday', 'view_holiday',
    'manage_learninghub', 'view_learninghub',
    'manage_dashboard',
  ],
  employee: [
    'view_employee',
    'add_attendance', 'view_attendance', 'manage_attandance', 'manage_attendance',
    'add_timesheet', 'view_timesheet', 'manage_timesheet',
    'view_project', 'manage_project',
    'view_task', 'update_task', 'manage_task',
    'view_holiday', 'manage_holiday',
    'manage_blogs', 'view_blogs',
    'view_discussions',
    'view_policy', 'view_grievance',
    'manage_dashboard',
  ],
  trainer: [
    'view_learninghub', 'manage_learninghub', 'manage_batches', 'manage_classes',
    'manage_attendance', 'manage_assignments', 'grade_submissions', 'manage_assessments',
    'add_attendance', 'view_attendance',
    'manage_timesheet', 'view_timesheet', 'add_timesheet',
    'manage_task', 'view_task', 'update_task',
    'manage_holiday', 'view_holiday',
    'view_discussions',
    'manage_dashboard',
  ],
  trainee: [
    'view_learninghub', 'access_enrolled_content', 'submit_assignments',
    'take_assessments', 'view_certificates',
    'view_discussions',
    'view_policy', 'view_grievance',
  ],
  intern: [
    'view_employee',
    'add_attendance', 'view_attendance', 'manage_attandance', 'manage_attendance',
    'add_timesheet', 'view_timesheet', 'manage_timesheet',
    'view_project',
    'view_task', 'update_task', 'manage_task',
    'view_holiday', 'manage_holiday',
    'view_blogs', 'view_discussions',
    'view_policy',
    'manage_dashboard',
  ],
  support_staff: [
    'add_attendance', 'view_attendance', 'manage_attandance', 'manage_attendance',
    'add_timesheet', 'view_timesheet', 'manage_timesheet',
    'view_holiday', 'manage_holiday',
    'manage_dashboard',
  ],
};

// ==========================================
// 2. PERMISSION ALIASES & NORMALIZATIONS
// ==========================================
export const PERMISSION_ALIASES = {
  // Attendance variations
  manage_attendance: ['manage_attandance', 'attendance_manage', 'attendance'],
  manage_attandance: ['manage_attendance', 'attendance_manage', 'attendance'],
  view_attendance: ['view_attandance', 'read_attendance', 'read_attandance', 'attendance_view', 'attendance'],
  view_attandance: ['view_attendance', 'read_attendance', 'read_attandance', 'attendance_view', 'attendance'],
  add_attendance: ['add_attandance', 'create_attendance', 'create_attandance', 'punch_attendance'],
  add_attandance: ['add_attendance', 'create_attendance', 'create_attandance', 'punch_attendance'],
  create_attendance: ['create_attandance', 'add_attendance', 'add_attandance'],
  create_attandance: ['create_attendance', 'add_attendance', 'add_attandance'],

  // Project operations
  manage_project: ['manage_projects', 'project_manage', 'projects_manage', 'projects', 'project'],
  create_project: ['add_project', 'new_project', 'project_create'],
  add_project: ['create_project', 'new_project', 'project_add'],
  edit_project: ['update_project', 'modify_project', 'project_edit'],
  update_project: ['edit_project', 'modify_project', 'project_update'],
  delete_project: ['remove_project', 'destroy_project', 'project_delete'],
  remove_project: ['delete_project', 'destroy_project'],
  view_project: ['read_project', 'list_projects', 'view_projects', 'project_view', 'projects', 'project'],

  // Employee operations
  manage_employee: ['manage_employees', 'employee_manage', 'employees', 'employee'],
  create_employee: ['add_employee', 'new_employee', 'employee_create'],
  add_employee: ['create_employee', 'new_employee'],
  edit_employee: ['update_employee', 'modify_employee', 'employee_edit'],
  update_employee: ['edit_employee', 'modify_employee'],
  delete_employee: ['remove_employee', 'employee_delete'],
  remove_employee: ['delete_employee'],
  view_employee: ['read_employee', 'list_employees', 'view_employees', 'employees', 'employee'],

  // Payroll operations
  manage_payroll: ['payroll_manage', 'payroll', 'payrolls'],
  view_payroll: ['read_payroll', 'payroll_view', 'payroll'],
  export_payroll: ['download_payroll', 'payroll_export'],

  // Settings operations
  manage_settings: ['settings_manage', 'settings', 'admin_settings'],
  manage_roles: ['roles_manage', 'roles_permissions', 'manage_permissions'],
  manage_permissions: ['permissions_manage', 'roles_permissions', 'manage_roles'],

  // Recycle bin operations
  manage_recycle_bin: ['recycle_bin_manage', 'recycle_bin', 'manage_recyclebin'],
  view_recycle_bin: ['recycle_bin_view', 'recycle_bin', 'view_recyclebin'],

  // Contacts / Inquiries
  manage_contact: ['manage_contacts', 'contact_manage', 'contacts'],
  manage_contacts: ['manage_contact', 'contact_manage', 'contacts'],
  view_contacts: ['view_contact', 'read_contacts', 'contacts'],

  // Policies & Grievances
  manage_policy: ['policy_manage', 'policies', 'manage_policies'],
  view_policy: ['policy_view', 'view_policies', 'policies'],
  manage_grievance: ['grievance_manage', 'grievances', 'manage_grievances'],
  view_grievance: ['grievance_view', 'view_grievances', 'grievances'],

  // Learning Hub
  manage_learninghub: ['manage_learning_hub', 'manage_courses', 'manage_course', 'learninghub', 'courses'],
  view_learninghub: ['view_learning_hub', 'view_courses', 'view_course', 'learninghub', 'courses'],

  // Tasks & Timesheets
  manage_task: ['manage_tasks', 'task_manage', 'tasks', 'task'],
  manage_timesheet: ['manage_timesheets', 'timesheet_manage', 'timesheets', 'timesheet'],

  // Blogs, Careers, Holidays
  manage_blogs: ['manage_blog', 'blog_manage', 'blogs', 'blog'],
  manage_career: ['manage_careers', 'manage_jobs', 'career_manage', 'careers', 'jobs'],
  manage_holiday: ['manage_holidays', 'holiday_manage', 'holidays', 'holiday'],
  manage_dashboard: ['dashboard_manage', 'view_dashboard', 'dashboard'],
};

// ==========================================
// 3. RUNTIME EXTENSIBILITY REGISTRY
// ==========================================
const customRoles = new Map();
const customPermissions = new Set();
const customAliases = new Map();

/**
 * Register a newly created permission dynamically at runtime
 * @param {string} permissionSlug - Permission slug (e.g. 'export_payroll', 'manage_invoices')
 * @param {Object} options - { aliases?: string[], defaultRoles?: string[] }
 */
export const registerPermission = (permissionSlug, options = {}) => {
  if (!permissionSlug) return;
  const slug = String(permissionSlug).toLowerCase().trim();
  customPermissions.add(slug);

  if (Array.isArray(options.aliases)) {
    const existing = customAliases.get(slug) || [];
    customAliases.set(slug, [...new Set([...existing, ...options.aliases.map(a => String(a).toLowerCase().trim())])]);
  }

  if (Array.isArray(options.defaultRoles)) {
    options.defaultRoles.forEach((role) => {
      const normalizedRole = String(role).toLowerCase().trim();
      const rolePerms = customRoles.get(normalizedRole) || DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
      if (!rolePerms.includes(slug)) {
        customRoles.set(normalizedRole, [...rolePerms, slug]);
      }
    });
  }
};

/**
 * Register a new role or customize role permissions dynamically
 * @param {string} roleSlug - Role slug (e.g. 'qa_lead', 'auditor')
 * @param {string[]} permissions - Array of permission slugs
 */
export const registerRole = (roleSlug, permissions = []) => {
  if (!roleSlug) return;
  const slug = String(roleSlug).toLowerCase().trim();
  const perms = permissions.map(p => String(p).toLowerCase().trim());
  customRoles.set(slug, perms);
};

// ==========================================
// 4. CORE RESOLVERS & EXTRACTION HELPERS
// ==========================================

/**
 * Extract normalized role string from user or role argument
 * @param {Object|string} user - User object or role string
 * @returns {string} Normalized role slug
 */
export const getUserRole = (user) => {
  if (!user) return '';
  if (typeof user === 'string') return user.toLowerCase().trim();
  if (typeof user.role === 'string') return user.role.toLowerCase().trim();
  if (user.role && typeof user.role.slug === 'string') return user.role.slug.toLowerCase().trim();
  if (user.role && typeof user.role.name === 'string') return user.role.name.toLowerCase().trim();
  return '';
};

/**
 * Checks if the user is a superadmin with universal access
 * @param {Object|string} user
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  const role = getUserRole(user);
  if (role === 'superadmin') return true;

  // Check permissions array for wildcard '*'
  const perms = getUserPermissions(user, false);
  return perms.includes('*') || perms.includes('all');
};

/**
 * Extract all active permissions for a user or role
 * Automatically falls back to DEFAULT_ROLE_PERMISSIONS if permissions array is empty
 * @param {Object|string|string[]} user - User object, role string, or permissions array
 * @param {boolean} fallbackToDefaults - Fallback to role matrix if array empty
 * @returns {string[]} Array of normalized permission slugs
 */
export const getUserPermissions = (user, fallbackToDefaults = true) => {
  if (!user) return [];

  // Case 1: Array passed directly
  if (Array.isArray(user)) {
    return user
      .filter((p) => p && typeof p === 'string')
      .map((p) => p.toLowerCase().trim());
  }

  // Case 2: User object with permissions array
  if (typeof user === 'object' && Array.isArray(user.permissions)) {
    const valid = user.permissions
      .filter((p) => p && typeof p === 'string')
      .map((p) => p.toLowerCase().trim());
    if (valid.length > 0) return valid;
  }

  // Case 3: Fall back to role-based permissions matrix
  if (fallbackToDefaults) {
    const role = getUserRole(user);
    if (role) {
      if (customRoles.has(role)) {
        return customRoles.get(role);
      }
      if (DEFAULT_ROLE_PERMISSIONS[role]) {
        return [...DEFAULT_ROLE_PERMISSIONS[role]];
      }
    }
  }

  return [];
};

/**
 * Check if a user has a specific permission (exact match, aliases, wildcards, or superadmin)
 * Supports checking dynamically created permissions.
 *
 * @param {Object|string} user - Current user object or role string
 * @param {string} permission - Permission slug to verify (e.g. 'manage_project', 'create_employee')
 * @returns {boolean} True if granted
 */
export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;

  // Superadmin always has full access
  if (isSuperAdmin(user)) return true;

  const target = String(permission).toLowerCase().trim();
  const permissions = getUserPermissions(user);

  // 1. Direct match
  if (permissions.includes(target)) return true;

  // 2. Check predefined aliases
  const aliases = PERMISSION_ALIASES[target] || [];
  for (const alias of aliases) {
    if (permissions.includes(alias)) return true;
  }

  // 3. Check custom runtime aliases
  const runtimeAliases = customAliases.get(target) || [];
  for (const alias of runtimeAliases) {
    if (permissions.includes(alias)) return true;
  }

  // 4. Reverse alias match: if user has a permission whose aliases include target
  for (const p of permissions) {
    const pAliases = PERMISSION_ALIASES[p];
    if (pAliases && pAliases.includes(target)) return true;

    const pCustom = customAliases.get(p);
    if (pCustom && pCustom.includes(target)) return true;
  }

  // 5. Wildcard match (e.g. 'manage_*', 'project:*', '*')
  for (const p of permissions) {
    if (p === '*') return true;
    if (p.endsWith('*') && target.startsWith(p.slice(0, -1))) return true;
    if (p.includes(':*') && target.startsWith(p.replace(':*', ''))) return true;
  }

  return false;
};

/**
 * Check if user has ANY of the given permissions
 * @param {Object|string} user
 * @param {string[]} permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions = []) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.some((perm) => hasPermission(user, perm));
};

/**
 * Check if user has ALL of the given permissions
 * @param {Object|string} user
 * @param {string[]} permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions = []) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.every((perm) => hasPermission(user, perm));
};

// ==========================================
// 5. ACTION-BASED GRANULAR PERMISSION RESOLVER
// ==========================================

const ACTION_MAP = {
  // Create / Add actions
  add: 'create',
  create: 'create',
  new: 'create',
  insert: 'create',
  post: 'create',

  // Edit / Update actions
  edit: 'edit',
  update: 'edit',
  modify: 'edit',
  patch: 'edit',
  put: 'edit',

  // Delete / Remove actions
  delete: 'delete',
  remove: 'delete',
  destroy: 'delete',
  del: 'delete',

  // View / Read actions
  view: 'view',
  read: 'view',
  get: 'view',
  list: 'view',
  show: 'view',

  // Manage / Administer actions
  manage: 'manage',
  admin: 'manage',
  all: 'manage',
};

const FEATURE_SYNONYMS = {
  attendance: ['attandance', 'attendance'],
  attandance: ['attandance', 'attendance'],
  project: ['project', 'projects'],
  projects: ['project', 'projects'],
  employee: ['employee', 'employees'],
  employees: ['employee', 'employees'],
  task: ['task', 'tasks'],
  tasks: ['task', 'tasks'],
  timesheet: ['timesheet', 'timesheets'],
  timesheets: ['timesheet', 'timesheets'],
  learninghub: ['learninghub', 'learning_hub', 'courses', 'course'],
  blog: ['blog', 'blogs'],
  blogs: ['blog', 'blogs'],
  career: ['career', 'careers', 'job', 'jobs', 'application', 'applications'],
  holiday: ['holiday', 'holidays'],
  payroll: ['payroll', 'payrolls', 'salary', 'stipend'],
  settings: ['settings', 'setting', 'roles', 'permissions', 'roles_permissions'],
  recycle_bin: ['recycle_bin', 'recyclebin', 'trash'],
  contact: ['contact', 'contacts', 'inquiry', 'inquiries'],
  contacts: ['contact', 'contacts', 'inquiry', 'inquiries'],
  policy: ['policy', 'policies'],
  grievance: ['grievance', 'grievances'],
  discussion: ['discussion', 'discussions'],
  dashboard: ['dashboard'],
};

/**
 * Universal Granular Feature Permission Checker
 *
 * Examples:
 *   can(user, 'add', 'project')
 *   can(user, 'edit', 'project')
 *   can(user, 'delete', 'project')
 *   can(user, 'view', 'attendance')
 *   can(user, 'add', 'attendance')
 *   can(user, 'export', 'payroll') // Works dynamically for new features!
 *
 * @param {Object|string} user - User object or role string
 * @param {string} action - Action ('add', 'edit', 'delete', 'view', 'manage', etc.)
 * @param {string} feature - Feature/Module ('project', 'attendance', 'employee', etc.)
 * @param {Object} [context] - Optional context data (e.g. { ownerId: user._id })
 * @returns {boolean}
 */
export const can = (user, action, feature, context = {}) => {
  if (!user || !action || !feature) return false;
  if (isSuperAdmin(user)) return true;

  const rawAction = String(action).toLowerCase().trim();
  const rawFeature = String(feature).toLowerCase().trim();
  const normalizedAction = ACTION_MAP[rawAction] || rawAction;
  const featureVariants = FEATURE_SYNONYMS[rawFeature] || [rawFeature];

  // Build candidate permission keys to check in order of specificity
  const candidateKeys = [];

  for (const feat of featureVariants) {
    // 1. Specific action permissions (e.g. 'create_project', 'add_project', 'delete_project')
    candidateKeys.push(`${normalizedAction}_${feat}`);
    candidateKeys.push(`${rawAction}_${feat}`);
    candidateKeys.push(`${feat}_${normalizedAction}`);
    candidateKeys.push(`${feat}_${rawAction}`);
    candidateKeys.push(`${feat}:${normalizedAction}`);

    // 2. High-level 'manage' permission (e.g. 'manage_project', 'manage_attandance')
    // In RBAC, 'manage_<feature>' grants full rights (create, edit, delete, view)
    candidateKeys.push(`manage_${feat}`);
    candidateKeys.push(`${feat}_manage`);

    // 3. For 'view' action: check view/read variants
    if (normalizedAction === 'view') {
      candidateKeys.push(`view_${feat}`);
      candidateKeys.push(`read_${feat}`);
      candidateKeys.push(`list_${feat}`);
    }
  }

  // Check if user has any of these candidate permissions
  for (const permKey of candidateKeys) {
    if (hasPermission(user, permKey)) {
      return true;
    }
  }

  // Special contextual rules:
  // For attendance: any authenticated user (employee, intern, etc.) can view or punch their OWN attendance
  if (
    featureVariants.includes('attendance') &&
    (normalizedAction === 'view' || normalizedAction === 'create') &&
    context &&
    context.isSelf
  ) {
    return true;
  }

  // If action is 'view' and user has any management or creation rights on the feature, grant view access
  if (normalizedAction === 'view') {
    for (const feat of featureVariants) {
      if (
        hasPermission(user, `create_${feat}`) ||
        hasPermission(user, `edit_${feat}`) ||
        hasPermission(user, `manage_${feat}`)
      ) {
        return true;
      }
    }
  }

  return false;
};

// ==========================================
// 6. GRANULAR FEATURE HELPERS
// ==========================================

// --- Project Feature Permissions ---
export const canViewProject = (user) => can(user, 'view', 'project');
export const canAddProject = (user) => can(user, 'create', 'project');
export const canCreateProject = canAddProject;
export const canEditProject = (user, project) => can(user, 'edit', 'project', { project });
export const canDeleteProject = (user, project) => can(user, 'delete', 'project', { project });
export const canManageProject = (user) => hasPermission(user, 'manage_project');

// --- Attendance Feature Permissions ---
export const canViewAttendance = (user, context = {}) => can(user, 'view', 'attendance', context);
export const canAddAttendance = (user, context = {}) => can(user, 'create', 'attendance', context);
export const canPunchAttendance = canAddAttendance;
export const canEditAttendance = (user) => can(user, 'edit', 'attendance');
export const canDeleteAttendance = (user) => can(user, 'delete', 'attendance');
export const canManageAttendance = (user) =>
  hasPermission(user, 'manage_attendance') || hasPermission(user, 'manage_attandance');

// --- Employee Feature Permissions ---
export const canViewEmployee = (user) => can(user, 'view', 'employee');
export const canAddEmployee = (user) => can(user, 'create', 'employee');
export const canCreateEmployee = canAddEmployee;
export const canEditEmployee = (user) => can(user, 'edit', 'employee');
export const canDeleteEmployee = (user) => can(user, 'delete', 'employee');
export const canManageEmployee = (user) => hasPermission(user, 'manage_employee');

// --- Task & Timesheet Feature Permissions ---
export const canViewTask = (user) => can(user, 'view', 'task');
export const canAddTask = (user) => can(user, 'create', 'task');
export const canManageTask = (user) => hasPermission(user, 'manage_task');

export const canViewTimesheet = (user) => can(user, 'view', 'timesheet');
export const canManageTimesheet = (user) => hasPermission(user, 'manage_timesheet');

// --- LearningHub & Courses Feature Permissions ---
export const canViewLearningHub = (user) =>
  hasPermission(user, 'view_learninghub') || hasPermission(user, 'manage_learninghub');
export const canManageLearningHub = (user) => hasPermission(user, 'manage_learninghub');
export const canManageClasses = (user) => hasPermission(user, 'manage_classes');
export const canManageAssignments = (user) => hasPermission(user, 'manage_assignments');
export const canSubmitAssignments = (user) => hasPermission(user, 'submit_assignments');
export const canGradeSubmissions = (user) => hasPermission(user, 'grade_submissions');
export const canTakeAssessments = (user) => hasPermission(user, 'take_assessments');
export const canManageAssessments = (user) => hasPermission(user, 'manage_assessments');
export const canViewCertificates = (user) => hasPermission(user, 'view_certificates');
export const canAccessEnrolledContent = (user) => hasPermission(user, 'access_enrolled_content');

// --- Blogs, Careers, Holidays Feature Permissions ---
export const canManageBlogs = (user) => hasPermission(user, 'manage_blogs');
export const canManageCareer = (user) => hasPermission(user, 'manage_career');
export const canManageHoliday = (user) => hasPermission(user, 'manage_holiday');

// ==========================================
// 7. DEFAULT EXPORT BUNDLE
// ==========================================
const permissionUtils = {
  // Core checks
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  can,
  isSuperAdmin,
  getUserRole,
  getUserPermissions,

  // Runtime registry for new permissions & roles
  registerPermission,
  registerRole,

  // Project permissions
  canViewProject,
  canAddProject,
  canCreateProject,
  canEditProject,
  canDeleteProject,
  canManageProject,

  // Attendance permissions
  canViewAttendance,
  canAddAttendance,
  canPunchAttendance,
  canEditAttendance,
  canDeleteAttendance,
  canManageAttendance,

  // Employee permissions
  canViewEmployee,
  canAddEmployee,
  canCreateEmployee,
  canEditEmployee,
  canDeleteEmployee,
  canManageEmployee,

  // Tasks & Timesheets
  canViewTask,
  canAddTask,
  canManageTask,
  canViewTimesheet,
  canManageTimesheet,

  // Learning Hub
  canViewLearningHub,
  canManageLearningHub,
  canManageClasses,
  canManageAssignments,
  canSubmitAssignments,
  canGradeSubmissions,
  canTakeAssessments,
  canManageAssessments,
  canViewCertificates,
  canAccessEnrolledContent,

  // Blogs, Careers, Holidays
  canManageBlogs,
  canManageCareer,
  canManageHoliday,

  // Constants
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_ALIASES,
};

export default permissionUtils;
