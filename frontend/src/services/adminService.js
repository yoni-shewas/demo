import apiClient from '../utils/apiClient';

// User Management
export const getAllUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post('/api/admin/users', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/api/admin/users/${userId}`);
  return response.data;
};

// Import Users
export const importUsers = async (formData) => {
  const response = await apiClient.post('/api/admin/import-users', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Export Functions
export const exportUsersCSV = async () => {
  const response = await apiClient.get('/api/admin/users/export/csv', {
    responseType: 'blob',
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportUsersSQL = async () => {
  const response = await apiClient.get('/api/admin/users/export/sql', {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.sql`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await apiClient.get('/api/admin/stats');
  return response.data;
};

// Batches Management
export const getAllBatches = async () => {
  const response = await apiClient.get('/api/admin/batches');
  return response.data;
};

export const createBatch = async (batchData) => {
  const response = await apiClient.post('/api/admin/batches', batchData);
  return response.data;
};

export const updateBatch = async (batchId, batchData) => {
  const response = await apiClient.put(`/api/admin/batches/${batchId}`, batchData);
  return response.data;
};

export const deleteBatch = async (batchId) => {
  const response = await apiClient.delete(`/api/admin/batches/${batchId}`);
  return response.data;
};

// Sections Management
export const getAllSections = async () => {
  const response = await apiClient.get('/api/admin/sections');
  return response.data;
};

export const getSectionById = async (sectionId) => {
  const response = await apiClient.get(`/api/admin/sections/${sectionId}`);
  return response.data;
};

export const createSection = async (sectionData) => {
  const response = await apiClient.post('/api/admin/sections', sectionData);
  return response.data;
};

export const updateSection = async (sectionId, sectionData) => {
  const response = await apiClient.put(`/api/admin/sections/${sectionId}`, sectionData);
  return response.data;
};

export const deleteSection = async (sectionId) => {
  const response = await apiClient.delete(`/api/admin/sections/${sectionId}`);
  return response.data;
};

export const assignUsersToSection = async (sectionId, data) => {
  const response = await apiClient.post(`/api/admin/sections/${sectionId}/assign`, data);
  return response.data;
};

export const removeInstructorFromSection = async (sectionId) => {
  const response = await apiClient.delete(`/api/admin/sections/${sectionId}/instructor`);
  return response.data;
};

export const removeStudentsFromSection = async (sectionId, studentIds) => {
  const response = await apiClient.post(`/api/admin/sections/${sectionId}/remove-students`, {
    studentIds,
  });
  return response.data;
};

export const getAvailableInstructors = async () => {
  const response = await apiClient.get('/api/admin/sections/instructors/available');
  return response.data;
};

export const getAvailableStudents = async (batchId = null) => {
  const params = batchId ? { batchId } : {};
  const response = await apiClient.get('/api/admin/sections/students/available', { params });
  return response.data;
};

// Lessons Management
export const getAllLessons = async () => {
  const response = await apiClient.get('/api/admin/lessons');
  return response.data;
};

// Submissions Management
export const getAllSubmissions = async () => {
  const response = await apiClient.get('/api/admin/submissions');
  return response.data;
};

export default {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  exportUsersCSV,
  exportUsersSQL,
  getDashboardStats,
  getAllBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  assignUsersToSection,
  removeInstructorFromSection,
  removeStudentsFromSection,
  getAvailableInstructors,
  getAvailableStudents,
  getAllLessons,
  getAllSubmissions,
};
