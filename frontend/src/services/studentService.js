import apiClient from '../utils/apiClient';

// Profile
export const getProfile = async () => {
  const response = await apiClient.get('/api/student/profile');
  return response.data;
};

// Lessons
export const getLessons = async () => {
  const response = await apiClient.get('/api/student/lessons');
  return response.data;
};

// Assignments
export const getAssignments = async () => {
  const response = await apiClient.get('/api/student/assignments');
  return response.data;
};

// Submissions
export const getSubmissions = async () => {
  const response = await apiClient.get('/api/student/submissions');
  return response.data;
};

export const submitAssignment = async (submissionData) => {
  const response = await apiClient.post('/api/student/submissions', submissionData);
  return response.data;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await apiClient.get('/api/student/stats');
  return response.data;
};

export default {
  getProfile,
  getLessons,
  getAssignments,
  getSubmissions,
  submitAssignment,
  getDashboardStats,
};
