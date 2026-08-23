import { baseApi } from './baseApi';

/**
 * Course & Learning Hub Service Module
 */
export const courseApi = {
  getCourses: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return baseApi.get(`/courses${qs ? `?${qs}` : ''}`);
  },

  getCourseById: async (id) => {
    return baseApi.get(`/courses/${id}`);
  },

  createCourse: async (courseData) => {
    return baseApi.post('/courses', courseData);
  },

  updateCourse: async (id, courseData) => {
    return baseApi.put(`/courses/${id}`, courseData);
  },

  deleteCourse: async (id) => {
    return baseApi.delete(`/courses/${id}`);
  },

  // Student Enrollment Applications
  getCourseApplications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return baseApi.get(`/course-applications${qs ? `?${qs}` : ''}`);
  },

  submitCourseApplication: async (applicationData) => {
    return baseApi.post('/course-applications', applicationData);
  },

  updateCourseApplicationStatus: async (id, statusData) => {
    return baseApi.put(`/course-applications/${id}`, statusData);
  },

  deleteCourseApplication: async (id) => {
    return baseApi.delete(`/course-applications/${id}`);
  },
};

export default courseApi;
