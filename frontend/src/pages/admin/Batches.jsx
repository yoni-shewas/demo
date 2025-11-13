import { useState, useEffect } from 'react';
import { School, Plus, Edit2, Trash2, Save, X, Users, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/apiClient';

const Batches = () => {
  const [sections, setSections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseCode: '',
    term: '',
    year: new Date().getFullYear(),
  });
  const [assignData, setAssignData] = useState({
    instructorId: '',
    studentIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, usersRes] = await Promise.allSettled([
        apiClient.get('/api/admin/sections'),
        apiClient.get('/api/admin/users'),
      ]);

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

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/admin/sections', formData);
      toast.success('Section/Batch created successfully!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        courseCode: '',
        term: '',
        year: new Date().getFullYear(),
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
      await apiClient.post(`/api/admin/sections/${selectedSection.id}/assign`, assignData);
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
          <h1 className="text-2xl font-bold text-gray-900">Batches & Sections</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage course sections and assign instructors/students
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Section</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sections.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
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

      {/* Sections Grid */}
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
                <input
                  type="text"
                  value={editingSection.courseCode}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, courseCode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Course Code"
                />
                <textarea
                  value={editingSection.description}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Description"
                  rows="3"
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
                      {section.courseCode && (
                        <p className="text-sm text-gray-600 mt-1">{section.courseCode}</p>
                      )}
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

                  {section.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {section.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-600">
                        {section.term} {section.year}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{section.enrollmentCount || 0} students</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setShowAssignModal(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Assign Users</span>
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
              Create your first section to organize courses
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              <span>Create Section</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Section/Batch</h2>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., CS101 Section A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Section description"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select Term</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="2025"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create Section
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
    </div>
  );
};

export default Batches;
