import { useState, useEffect } from 'react';
import { School, Plus, Edit2, Trash2, Save, X, Users, UserPlus, UserMinus, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import * as adminService from '../../services/adminService';
import apiClient from '../../utils/apiClient';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [batchFormData, setBatchFormData] = useState({
    name: '',
    year: '',
    type: '',
  });
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    batchId: '',
  });
  const [assignData, setAssignData] = useState({
    instructorId: '',
    studentIds: [],
  });
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingSection, setManagingSection] = useState(null);
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchesRes, sectionsRes, usersRes] = await Promise.allSettled([
        apiClient.get('/api/admin/batches'),
        apiClient.get('/api/admin/sections'),
        apiClient.get('/api/admin/users'),
      ]);

      if (batchesRes.status === 'fulfilled') {
        setBatches(batchesRes.value.data.batches || batchesRes.value.data || []);
      }

      if (sectionsRes.status === 'fulfilled') {
        setSections(sectionsRes.value.data.sections || sectionsRes.value.data || []);
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.users || usersRes.value.data || []);
      }

      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/admin/batches', batchFormData);
      toast.success('Batch created successfully!');
      setShowCreateBatchModal(false);
      setBatchFormData({
        name: '',
        year: '',
        type: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/admin/sections', sectionFormData);
      toast.success('Section created successfully!');
      setShowCreateSectionModal(false);
      setSectionFormData({
        name: '',
        batchId: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error(error.response?.data?.message || 'Failed to create section');
    }
  };

  const handleUpdateSection = async (sectionId) => {
    try {
      await apiClient.put(`/api/admin/sections/${sectionId}`, editingSection);
      toast.success('Section updated successfully!');
      setEditingSection(null);
      loadData();
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error(error.response?.data?.message || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section/batch?')) return;

    try {
      await apiClient.delete(`/api/admin/sections/${sectionId}`);
      toast.success('Section deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  const handleAssignUsers = async (e) => {
    e.preventDefault();
    try {
      // Get instructor profile ID if instructor is selected
      let instructorProfileId = null;
      if (assignData.instructorId) {
        const instructor = instructors.find(i => i.id === assignData.instructorId);
        instructorProfileId = instructor?.instructorProfile?.id;
      }

      // Get student profile IDs for selected students
      const studentProfileIds = assignData.studentIds.map(userId => {
        const student = students.find(s => s.id === userId);
        return student?.studentProfile?.id;
      }).filter(Boolean);

      await adminService.assignUsersToSection(selectedSection.id, {
        instructorId: instructorProfileId,
        studentIds: studentProfileIds,
      });
      toast.success('Users assigned successfully!');
      setShowAssignModal(false);
      setSelectedSection(null);
      setAssignData({ instructorId: '', studentIds: [] });
      loadData();
    } catch (error) {
      console.error('Error assigning users:', error);
      toast.error(error.response?.data?.message || 'Failed to assign users');
    }
  };

  const handleRemoveInstructor = async (sectionId) => {
    if (!confirm('Remove instructor from this section?')) return;
    try {
      await adminService.removeInstructorFromSection(sectionId);
      toast.success('Instructor removed successfully!');
      loadData();
    } catch (error) {
      console.error('Error removing instructor:', error);
      toast.error(error.response?.data?.message || 'Failed to remove instructor');
    }
  };

  const handleRemoveStudents = async (sectionId, studentIds) => {
    if (!confirm(`Remove ${studentIds.length} student(s) from this section?`)) return;
    try {
      await adminService.removeStudentsFromSection(sectionId, studentIds);
      toast.success('Students removed successfully!');
      if (managingSection) {
        // Refresh the managing section data
        const updatedSection = sections.find(s => s.id === sectionId);
        setManagingSection(updatedSection);
      }
      loadData();
    } catch (error) {
      console.error('Error removing students:', error);
      toast.error(error.response?.data?.message || 'Failed to remove students');
    }
  };

  const openManageModal = async (section) => {
    setManagingSection(section);
    setShowManageModal(true);
    try {
      const [instructorsRes, studentsRes] = await Promise.all([
        adminService.getAvailableInstructors(),
        adminService.getAvailableStudents(section.batchId),
      ]);
      setAvailableInstructors(instructorsRes.instructors || []);
      setAvailableStudents(studentsRes.students || []);
    } catch (error) {
      console.error('Error loading available users:', error);
      toast.error('Failed to load available users');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setAssignData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  const instructors = users.filter((u) => u.role === 'INSTRUCTOR');
  const students = users.filter((u) => u.role === 'STUDENT');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading batches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch & Section Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create batches (RCD/ECD) with Ethiopian calendar year, then add sections
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateBatchModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Batch</span>
          </button>
          <button
            onClick={() => setShowCreateSectionModal(true)}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Section</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{batches.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <School className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sections.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500">
              <School className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Instructors</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{instructors.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{students.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Batches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-lg border-2 border-blue-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{batch.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {batch.type === 'RCD' ? 'Regular' : 'Extension'}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      {batch.year} E.C.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this batch?')) {
                      apiClient.delete(`/api/admin/batches/${batch.id}`)
                        .then(() => {
                          toast.success('Batch deleted');
                          loadData();
                        })
                        .catch(() => toast.error('Failed to delete'));
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p>{sections.filter(s => s.batchId === batch.id).length} sections</p>
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Batches Yet</h3>
              <p className="text-sm text-gray-600 mb-6">
                Create your first batch (RCD or ECD) to get started
              </p>
              <button
                onClick={() => setShowCreateBatchModal(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Batch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {editingSection?.id === section.id ? (
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Section Name"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateSection(section.id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{section.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {section.batch && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                            {section.batch.name} - {section.batch.year} E.C.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingSection({ ...section })}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-4">
                    <div className="text-gray-600">
                      <p className="text-xs text-gray-500">Instructor:</p>
                      <p className="font-medium text-gray-900">
                        {section.instructor?.user 
                          ? `${section.instructor.user.firstName} ${section.instructor.user.lastName}`
                          : 'Not assigned'}
                      </p>
                      {section.instructor?.user && (
                        <p className="text-xs text-gray-500">{section.instructor.user.email}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{section.students?.length || 0} students</span>
                    </div>
                  </div>

                  {/* Instructor Management */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">Instructor:</p>
                      {section.instructor && (
                        <button
                          onClick={() => handleRemoveInstructor(section.id)}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                          title="Remove instructor"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {section.instructor?.user 
                        ? `${section.instructor.user.firstName} ${section.instructor.user.lastName}`
                        : 'Not assigned'}
                    </div>
                  </div>

                  {/* Students List */}
                  {section.students && section.students.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Students ({section.students.length}):</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {section.students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-blue-700">
                                  {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student.user?.firstName} {student.user?.lastName}
                                </p>
                                {student.studentId && (
                                  <p className="text-gray-500">ID: {student.studentId}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveStudents(section.id, [student.id])}
                              className="text-red-600 hover:text-red-800"
                              title="Remove student"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => openManageModal(section)}
                    className="flex-1 flex items-center justify-center space-x-2 text-sm bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Users</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {sections.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Yet</h3>
            <p className="text-sm text-gray-600 mb-6">
              Create sections under existing batches
            </p>
            <button
              onClick={() => setShowCreateSectionModal(true)}
              className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              disabled={batches.length === 0}
            >
              <Plus className="h-4 w-4" />
              <span>Create Section</span>
            </button>
            {batches.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">Create a batch first</p>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Batch</h2>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={batchFormData.name}
                  onChange={(e) => setBatchFormData({ ...batchFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024 RCD Batch"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={batchFormData.type}
                  onChange={(e) => setBatchFormData({ ...batchFormData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="RCD">RCD (Regular)</option>
                  <option value="ECD">ECD (Extension)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year (Ethiopian Calendar) *
                </label>
                <input
                  type="number"
                  value={batchFormData.year}
                  onChange={(e) => setBatchFormData({ ...batchFormData, year: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2017"
                  min="2000"
                  max="2100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Ethiopian Calendar year</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Batch
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateBatchModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Section Modal */}
      {showCreateSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Section</h2>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Batch *
                </label>
                <select
                  value={sectionFormData.batchId}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, batchId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} ({batch.type}) - {batch.year} E.C.
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose which batch this section belongs to
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionFormData.name}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                  placeholder="e.g., Section A, Morning Class"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Courses will be added to batches, not individual sections
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                >
                  Create Section
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSectionModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Users Modal */}
      {showAssignModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Assign Users to {selectedSection.name}
            </h2>
            <form onSubmit={handleAssignUsers} className="space-y-6">
              {/* Instructor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Instructor
                </label>
                <select
                  value={assignData.instructorId}
                  onChange={(e) =>
                    setAssignData({ ...assignData, instructorId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select Instructor (Optional)</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.firstName} {instructor.lastName} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Students Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Students ({assignData.studentIds.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={assignData.studentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{student.email}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No students available
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Assign Users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedSection(null);
                    setAssignData({ instructorId: '', studentIds: [] });
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Section Modal (Assign/Remove) */}
      {showManageModal && managingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage {managingSection.name}
              </h2>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setManagingSection(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Instructor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Current Instructor</span>
                </h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  {managingSection.instructor ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {managingSection.instructor.user.firstName} {managingSection.instructor.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{managingSection.instructor.user.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveInstructor(managingSection.id)}
                        className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                      >
                        <UserMinus className="h-4 w-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No instructor assigned</p>
                  )}
                </div>

                {/* Assign New Instructor */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assign Instructor</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {availableInstructors.map((instructor) => {
                      const isAssigned = managingSection.instructor?.id === instructor.id;
                      return (
                        <button
                          key={instructor.id}
                          onClick={async () => {
                            if (isAssigned) return;
                            try {
                              await adminService.assignUsersToSection(managingSection.id, {
                                instructorId: instructor.id,
                              });
                              toast.success('Instructor assigned!');
                              loadData();
                              const updated = sections.find(s => s.id === managingSection.id);
                              setManagingSection(updated);
                            } catch (error) {
                              toast.error('Failed to assign instructor');
                            }
                          }}
                          disabled={isAssigned}
                          className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                            isAssigned ? 'bg-blue-50 cursor-not-allowed' : 'cursor-pointer'
                          } border-b border-gray-200 last:border-0`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {instructor.user.firstName} {instructor.user.lastName}
                            {isAssigned && <span className="ml-2 text-blue-600">(Current)</span>}
                          </p>
                          <p className="text-xs text-gray-600">{instructor.user.email}</p>
                          {instructor.sections.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Teaching: {instructor.sections.map(s => s.name).join(', ')}
                            </p>
                          )}
                        </button>
                      );
                    })}
                    {availableInstructors.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No instructors available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current & Available Students */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Students ({managingSection.students?.length || 0})</span>
                </h3>
                
                {/* Current Students */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Students</h4>
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {managingSection.students && managingSection.students.length > 0 ? (
                      managingSection.students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-700">
                                {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {student.user?.firstName} {student.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{student.user?.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudents(managingSection.id, [student.id])}
                            className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No students enrolled</p>
                    )}
                  </div>
                </div>

                {/* Add Students */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add Students</h4>
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {availableStudents
                      .filter(s => !managingSection.students?.find(ms => ms.id === s.id))
                      .map((student) => (
                        <button
                          key={student.id}
                          onClick={async () => {
                            try {
                              await adminService.assignUsersToSection(managingSection.id, {
                                studentIds: [student.id],
                              });
                              toast.success('Student added!');
                              loadData();
                              const updated = sections.find(s => s.id === managingSection.id);
                              setManagingSection(updated);
                            } catch (error) {
                              toast.error('Failed to add student');
                            }
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-xs font-semibold text-green-700">
                                {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {student.user?.firstName} {student.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{student.user?.email}</p>
                              {student.section && (
                                <p className="text-xs text-amber-600 mt-1">
                                  Currently in: {student.section.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    {availableStudents.filter(s => !managingSection.students?.find(ms => ms.id === s.id)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No students available to add</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setManagingSection(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
