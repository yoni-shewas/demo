import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit2, Trash2, Calendar, Filter, X } from 'lucide-react';
import { toast } from 'react-toastify';
import * as instructorService from '../../services/instructorService';
import apiClient from '../../utils/apiClient';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectionId: '',
    startDate: '',
    dueDate: '',
    maxPoints: 100,
    starterCode: '',
    solutionCode: '',
    testCases: '',
    hiddenTestCases: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, sectionFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, sectionsRes, profileRes] = await Promise.allSettled([
        instructorService.getAssignments(),
        apiClient.get('/api/instructor/sections'),
        instructorService.getProfile(),
      ]);

      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.assignments || assignmentsRes.value.data || []);
      }

      // Prioritize instructor's assigned sections from profile
      if (profileRes.status === 'fulfilled' && profileRes.value.sections) {
        const profileSections = profileRes.value.sections;
        setSections(Array.isArray(profileSections) ? profileSections : []);
      } else if (sectionsRes.status === 'fulfilled') {
        // Fallback to sections API (should already be filtered to instructor's sections)
        const sectionData = sectionsRes.value.data?.data || sectionsRes.value.data?.sections || [];
        setSections(Array.isArray(sectionData) ? sectionData : []);
      } else {
        // No sections available
        setSections([]);
      }

      toast.success('Assignments loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    if (sectionFilter === 'ALL') {
      setFilteredAssignments(assignments);
    } else {
      setFilteredAssignments(assignments.filter((a) => a.sectionId == sectionFilter));
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      toast.info('Creating assignment...');
      await instructorService.createAssignment(formData);
      toast.success('Assignment created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', sectionId: '', startDate: '', dueDate: '', maxPoints: 100, starterCode: '', solutionCode: '', testCases: '', hiddenTestCases: '' });
      loadData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      toast.info('Updating assignment...');
      await instructorService.updateAssignment(selectedAssignment.id, formData);
      toast.success('Assignment updated successfully!');
      setShowEditModal(false);
      setSelectedAssignment(null);
      setFormData({ title: '', description: '', sectionId: '', startDate: '', dueDate: '', maxPoints: 100, starterCode: '', solutionCode: '', testCases: '', hiddenTestCases: '' });
      loadData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await instructorService.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      sectionId: assignment.sectionId || '',
      startDate: assignment.startDate ? new Date(assignment.startDate).toISOString().slice(0, 16) : '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      maxPoints: assignment.maxPoints || 100,
      starterCode: typeof assignment.starterCode === 'object' ? JSON.stringify(assignment.starterCode, null, 2) : assignment.starterCode || '',
      solutionCode: typeof assignment.solutionCode === 'object' ? JSON.stringify(assignment.solutionCode, null, 2) : assignment.solutionCode || '',
      testCases: typeof assignment.testCases === 'object' ? JSON.stringify(assignment.testCases, null, 2) : assignment.testCases || '',
      hiddenTestCases: typeof assignment.hiddenTestCases === 'object' ? JSON.stringify(assignment.hiddenTestCases, null, 2) : assignment.hiddenTestCases || '',
    });
    setShowEditModal(true);
  };

  const getSectionName = (sectionId) => {
    const section = sections.find((s) => s.id == sectionId);
    return section ? section.name : 'Unknown Section';
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <div className="text-gray-600">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage student assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="ALL">All Sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            {filteredAssignments.length} {filteredAssignments.length === 1 ? 'assignment' : 'assignments'}
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                    {assignment.title}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isOverdue(assignment.dueDate)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {isOverdue(assignment.dueDate) ? 'Overdue' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(assignment)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {assignment.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {assignment.description}
                </p>
              )}

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{getSectionName(assignment.sectionId)}</span>
                  <span className="font-semibold text-gray-900">
                    {assignment.maxPoints || 100} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAssignments.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
            <p className="text-sm text-gray-600 mb-6">
              Create your first assignment for students
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assignment</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] my-8 overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Create New Assignment' : 'Edit Assignment'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedAssignment(null);
                  setFormData({ title: '', description: '', sectionId: '', startDate: '', dueDate: '', maxPoints: 100, starterCode: '', solutionCode: '', testCases: '', hiddenTestCases: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreateAssignment : handleUpdateAssignment} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Python Functions Exercise"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Assignment description and requirements"
                  rows="5"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={formData.maxPoints}
                    onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Code Sections */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Code & Testing</h3>
                
                <div className="space-y-4">
                  {/* Starter Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starter Code (JSON format)
                      <span className="text-xs text-gray-500 ml-2">Example: {"{ \"python\": \"def solve():\\n    pass\" }"}</span>
                    </label>
                    <textarea
                      value={formData.starterCode}
                      onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder='{"python": "def solve():\n    pass", "javascript": "function solve() {\n    // your code\n}"}'
                      rows="4"
                    />
                  </div>

                  {/* Solution Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Solution Code (JSON format) - Correct implementation
                      <span className="text-xs text-gray-500 ml-2">This should pass all test cases</span>
                    </label>
                    <textarea
                      value={formData.solutionCode}
                      onChange={(e) => setFormData({ ...formData, solutionCode: e.target.value })}
                      className="w-full border border-green-300 bg-green-50 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder='{"python": "def solve():\n    return sum([1, 2, 3])", "javascript": "function solve() {\n    return [1,2,3].reduce((a,b) => a+b, 0);\n}"}'
                      rows="5"
                    />
                  </div>

                  {/* Test Cases */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Public Test Cases (JSON format)
                      <span className="text-xs text-gray-500 ml-2">Visible to students for testing</span>
                    </label>
                    <textarea
                      value={formData.testCases}
                      onChange={(e) => setFormData({ ...formData, testCases: e.target.value })}
                      className="w-full border border-blue-300 bg-blue-50 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder='[{"input": "3", "expected": "6", "description": "Sum of 1+2+3"}, {"input": "5", "expected": "15"}]'
                      rows="4"
                    />
                  </div>

                  {/* Hidden Test Cases */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hidden Test Cases (JSON format)
                      <span className="text-xs text-gray-500 ml-2">Only for instructor grading - not visible to students</span>
                    </label>
                    <textarea
                      value={formData.hiddenTestCases}
                      onChange={(e) => setFormData({ ...formData, hiddenTestCases: e.target.value })}
                      className="w-full border border-purple-300 bg-purple-50 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder='[{"input": "100", "expected": "5050", "description": "Large number test"}]'
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {showCreateModal ? 'Create Assignment' : 'Update Assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedAssignment(null);
                    setFormData({ title: '', description: '', sectionId: '', dueDate: '', maxPoints: 100 });
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

export default Assignments;
