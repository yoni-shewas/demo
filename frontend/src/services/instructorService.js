import apiClient from '../utils/apiClient';

// Profile
export const getProfile = async () => {
  const response = await apiClient.get('/api/instructor/profile');
  return response.data;
};

// Lessons
export const getLessons = async () => {
  const response = await apiClient.get('/api/instructor/lessons');
  return response.data;
};

export const createLesson = async (lessonData, file = null) => {
  const formData = new FormData();
  
  // Add lesson data
  Object.keys(lessonData).forEach((key) => {
    formData.append(key, lessonData[key]);
  });
  
  // Add file if present
  if (file) {
    formData.append('file', file);
  }
  
  const response = await apiClient.post('/api/instructor/lessons', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateLesson = async (lessonId, lessonData, file = null) => {
  const formData = new FormData();
  
  Object.keys(lessonData).forEach((key) => {
    formData.append(key, lessonData[key]);
  });
  
  if (file) {
    formData.append('file', file);
  }
  
  const response = await apiClient.put(`/api/instructor/lessons/${lessonId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteLesson = async (lessonId) => {
  const response = await apiClient.delete(`/api/instructor/lessons/${lessonId}`);
  return response.data;
};

// Assignments
export const getAssignments = async () => {
  const response = await apiClient.get('/api/instructor/assignments');
  return response.data;
};

export const createAssignment = async (assignmentData) => {
  const response = await apiClient.post('/api/instructor/assignments', assignmentData);
  return response.data;
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  const response = await apiClient.put(`/api/instructor/assignments/${assignmentId}`, assignmentData);
  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await apiClient.delete(`/api/instructor/assignments/${assignmentId}`);
  return response.data;
};

// Submissions
export const getSubmissions = async () => {
  const response = await apiClient.get('/api/instructor/submissions');
  return response.data;
};

export const gradeSubmission = async (submissionId, gradeData) => {
  const response = await apiClient.post(`/api/instructor/submissions/${submissionId}/grade`, gradeData);
  return response.data;
};

export const downloadSubmission = async (submissionId) => {
  const response = await apiClient.get(`/api/instructor/submissions/${submissionId}/download`, {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `submission_${submissionId}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await apiClient.get('/api/instructor/stats');
  return response.data;
};

export default {
  getProfile,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
  downloadSubmission,
  getDashboardStats,
};
