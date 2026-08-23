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

// Aliases for clean backward compatibility
export { default as api } from './baseApi';
export { default as authService } from './authApi';
export { default as employeeService } from './employeeApi';
export { default as courseService } from './courseApi';
export { default as jobService } from './jobApi';
export { default as applicationService } from './applicationApi';
export { default as blogService } from './blogApi';
