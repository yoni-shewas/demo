import { useState, useEffect } from 'react';
import { Send, Download, Filter, CheckCircle, Clock, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import * as instructorService from '../../services/instructorService';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, assignmentFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsRes, assignmentsRes] = await Promise.allSettled([
        instructorService.getSubmissions(),
        instructorService.getAssignments(),
      ]);

      if (submissionsRes.status === 'fulfilled') {
        setSubmissions(submissionsRes.value.submissions || submissionsRes.value || []);
      }

      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.assignments || assignmentsRes.value.data || []);
      }

      toast.success('Submissions loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (assignmentFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.assignmentId === assignmentFilter);
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'GRADED') {
        filtered = filtered.filter((s) => s.grade !== null && s.grade !== undefined);
      } else if (statusFilter === 'PENDING') {
        filtered = filtered.filter((s) => s.grade === null || s.grade === undefined);
      }
    }

    setFilteredSubmissions(filtered);
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      toast.info('Submitting grade...');
      await instructorService.gradeSubmission(gradingSubmission.id, gradeData);
      toast.success('Submission graded successfully!');
      setGradingSubmission(null);
      setGradeData({ grade: '', feedback: '' });
      loadData();
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const handleDownload = async (submissionId) => {
    try {
      toast.info('Downloading submission...');
      await instructorService.downloadSubmission(submissionId);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading submission:', error);
      toast.error('Failed to download submission');
    }
  };

  const openGradingModal = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || '',
    });
  };

  const getAssignmentTitle = (assignmentId) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment ? assignment.title : 'Unknown Assignment';
  };

  const getAssignmentMaxPoints = (assignmentId) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment ? assignment.maxPoints || 100 : 100;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <div className="text-gray-600">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
        <p className="text-sm text-gray-600 mt-1">Review and grade student work</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="ALL">All Assignments</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Review</option>
              <option value="GRADED">Graded</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-sm text-gray-600">
            {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{submissions.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {submissions.filter((s) => !s.grade).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {submissions.filter((s) => s.grade !== null && s.grade !== undefined).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-gray-600">
                          {submission.student?.firstName?.charAt(0)}
                          {submission.student?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.student?.firstName} {submission.student?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{submission.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getAssignmentTitle(submission.assignmentId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(submission.submittedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.grade !== null && submission.grade !== undefined ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Graded
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.grade !== null && submission.grade !== undefined ? (
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">
                          {submission.grade}/{getAssignmentMaxPoints(submission.assignmentId)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownload(submission.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openGradingModal(submission)}
                        className="text-green-600 hover:text-green-900"
                        title={submission.grade ? 'Update Grade' : 'Grade'}
                      >
                        <Award className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions</h3>
            <p className="text-sm text-gray-600">
              {submissions.length === 0
                ? 'No submissions yet'
                : 'No submissions match your filters'}
            </p>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
              <p className="text-sm text-gray-600 mt-1">
                {gradingSubmission.student?.firstName} {gradingSubmission.student?.lastName} -{' '}
                {getAssignmentTitle(gradingSubmission.assignmentId)}
              </p>
            </div>

            <form onSubmit={handleGradeSubmission} className="p-6 space-y-4">
              {/* Submission Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="text-gray-900">
                    {new Date(gradingSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assignment:</span>
                  <span className="text-gray-900">
                    {getAssignmentTitle(gradingSubmission.assignmentId)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Max Points:</span>
                  <span className="text-gray-900">
                    {getAssignmentMaxPoints(gradingSubmission.assignmentId)}
                  </span>
                </div>
              </div>

              {/* Grade Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (Points) *
                </label>
                <input
                  type="number"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter grade"
                  min="0"
                  max={getAssignmentMaxPoints(gradingSubmission.assignmentId)}
                  required
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Provide feedback to the student..."
                  rows="6"
                />
              </div>

              {/* Submission Code Preview */}
              {gradingSubmission.submittedCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submitted Code
                  </label>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      <code>{gradingSubmission.submittedCode.code || 'No code submitted'}</code>
                    </pre>
                  </div>
                  {gradingSubmission.submittedCode.language && (
                    <p className="text-xs text-gray-500 mt-2">
                      Language: {gradingSubmission.submittedCode.language}
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Submit Grade
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGradingSubmission(null);
                    setGradeData({ grade: '', feedback: '' });
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

export default Submissions;
