import { baseApi } from './baseApi';

export const lmsApi = {
  // --- Curriculum (Modules & Lessons) ---
  getCurriculum: (courseId) => baseApi.get(`/curriculum/course/${courseId}`),
  createModule: (data) => baseApi.post('/curriculum/modules', data),
  updateModule: (id, data) => baseApi.put(`/curriculum/modules/${id}`, data),
  deleteModule: (id) => baseApi.delete(`/curriculum/modules/${id}`),
  reorderModules: (orderedModuleIds) => baseApi.post('/curriculum/modules/reorder', { orderedModuleIds }),
  
  createLesson: (data) => baseApi.post('/curriculum/lessons', data),
  updateLesson: (id, data) => baseApi.put(`/curriculum/lessons/${id}`, data),
  deleteLesson: (id) => baseApi.delete(`/curriculum/lessons/${id}`),
  reorderLessons: (orderedLessonIds) => baseApi.post('/curriculum/lessons/reorder', { orderedLessonIds }),
  getLessonPreview: (id) => baseApi.get(`/curriculum/lessons/${id}/preview`),

  // --- Batches ---
  getBatches: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.courseId) qs.append('courseId', params.courseId);
    if (params.status && params.status !== 'All') qs.append('status', params.status);
    if (params.mode && params.mode !== 'All') qs.append('mode', params.mode);
    if (params.search) qs.append('search', params.search);
    return baseApi.get(`/batches${qs.toString() ? `?${qs.toString()}` : ''}`);
  },
  getBatchById: (id) => baseApi.get(`/batches/${id}`),
  createBatch: (data) => baseApi.post('/batches', data),
  updateBatch: (id, data) => baseApi.put(`/batches/${id}`, data),
  deleteBatch: (id) => baseApi.delete(`/batches/${id}`),
  getBatchTrainees: (id) => baseApi.get(`/batches/${id}/trainees`),

  // --- Trainer Allocations & Dashboard ---
  getTrainers: () => baseApi.get('/trainer-assignments/trainers'),
  getTrainerAssignments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return baseApi.get(`/trainer-assignments${qs ? `?${qs}` : ''}`);
  },
  assignTrainer: (data) => baseApi.post('/trainer-assignments', data),
  removeTrainerAssignment: (id) => baseApi.delete(`/trainer-assignments/${id}`),
  getTrainerDashboardStats: () => baseApi.get('/trainer-assignments/trainer-dashboard-stats'),

  // --- Enrollments & Trainee Course Player ---
  getAllEnrollments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return baseApi.get(`/enrollments${qs ? `?${qs}` : ''}`);
  },
  getMyEnrollments: () => baseApi.get('/enrollments/my-enrollments'),
  getCoursePlayer: (enrollmentId) => baseApi.get(`/enrollments/${enrollmentId}/learning-path`),
  markLessonComplete: (enrollmentId, lessonId, data = {}) =>
    baseApi.post(`/enrollments/${enrollmentId}/lessons/${lessonId}/complete`, data),

  // --- Live Classes ---
  getClasses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return baseApi.get(`/classes${qs ? `?${qs}` : ''}`);
  },
  createClass: (data) => baseApi.post('/classes', data),
  updateClass: (id, data) => baseApi.put(`/classes/${id}`, data),
  deleteClass: (id) => baseApi.delete(`/classes/${id}`),

  // --- Learning Attendance ---
  getClassAttendance: (classId) => baseApi.get(`/learning-attendance/class/${classId}`),
  markClassAttendance: (data) => baseApi.post('/learning-attendance/batch-mark', data),
  getMyAttendance: () => baseApi.get('/learning-attendance/my-attendance'),

  // --- Assignments ---
  getAssignments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return baseApi.get(`/assignments${qs ? `?${qs}` : ''}`);
  },
  createAssignment: (data) => baseApi.post('/assignments', data),
  submitAssignment: (id, data) => baseApi.post(`/assignments/${id}/submit`, data),
  getAssignmentSubmissions: (id) => baseApi.get(`/assignments/${id}/submissions`),
  gradeSubmission: (submissionId, data) =>
    baseApi.post(`/assignments/submissions/${submissionId}/grade`, data),

  // --- Assessments & Quizzes ---
  getAssessments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return baseApi.get(`/assessments${qs ? `?${qs}` : ''}`);
  },
  getAssessmentById: (id) => baseApi.get(`/assessments/${id}`),
  createAssessment: (data) => baseApi.post('/assessments', data),
  submitAssessmentAttempt: (id, data) => baseApi.post(`/assessments/${id}/submit`, data),

  // --- Certificates ---
  getCertificates: () => baseApi.get('/certificates'),
  issueCertificate: (data) => baseApi.post('/certificates/issue', data),
  verifyCertificate: (code) => baseApi.get(`/certificates/verify/${code}`),

  // --- LMS Analytics ---
  getOverviewAnalytics: () => baseApi.get('/learning-analytics/overview'),
  getBatchReport: (batchId) => baseApi.get(`/learning-analytics/batch-report/${batchId}`),
};

export default lmsApi;
