/**
 * Unified Service Layer Barrel Export
 * GoTechEdu HRMS & Official Enterprise Gateway
 */

export { baseApi, API_BASE_URL } from './baseApi';
export { authApi } from './authApi';
export { employeeApi } from './employeeApi';
export { courseApi } from './courseApi';
export { jobApi } from './jobApi';
export { applicationApi } from './applicationApi';
export { blogApi } from './blogApi';
export { payrollApi } from './payrollApi';
export { settingsApi } from './settingsApi';
export { recycleBinApi } from './recycleBinApi';
export { rolePermissionApi } from './rolePermissionApi';
export { attendanceApi } from './attendanceApi';
export { timesheetApi } from './timesheetApi';
export { holidayApi } from './holidayApi';
export { projectApi } from './projectApi';
export { taskApi } from './taskApi';
export { offerApi } from './offerApi';
export { contactApi } from './contactApi';
export { discussionApi } from './discussionApi';

// Aliases for clean backward compatibility
export { default as api } from './baseApi';
export { default as authService } from './authApi';
export { default as employeeService } from './employeeApi';
export { default as courseService } from './courseApi';
export { default as jobService } from './jobApi';
export { default as applicationService } from './applicationApi';
export { default as blogService } from './blogApi';
export { default as payrollService } from './payrollApi';
export { default as settingsService } from './settingsApi';
export { default as recycleBinService } from './recycleBinApi';
export { default as rolePermissionService } from './rolePermissionApi';
export { default as attendanceService } from './attendanceApi';
export { default as timesheetService } from './timesheetApi';
export { default as holidayService } from './holidayApi';
export { default as projectService } from './projectApi';
export { default as taskService } from './taskApi';
export { default as contactService } from './contactApi';
export { default as discussionService } from './discussionApi';
