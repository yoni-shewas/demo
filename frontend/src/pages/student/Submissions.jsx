import { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle, Award, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import * as studentService from '../../services/studentService';

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, assignmentsData] = await Promise.allSettled([
        studentService.getSubmissions(),
        studentService.getAssignments(),
      ]);

      if (submissionsData.status === 'fulfilled') {
        setSubmissions(submissionsData.value.submissions || submissionsData.value || []);
      }

      if (assignmentsData.status === 'fulfilled') {
        setAssignments(assignmentsData.value.assignments || assignmentsData.value || []);
      }

      toast.success('Submissions loaded');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-sm text-gray-600 mt-1">View your submission status and grades</p>
      </div>

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
                {submissions.filter((s) => s.grade === null || s.grade === undefined).length}
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

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{getAssignmentTitle(submission.assignmentId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(submission.submittedAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.grade !== null && submission.grade !== undefined ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> Graded
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" /> Pending
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
                  <td className="px-6 py-4">
                    {submission.feedback ? (
                      <div className="flex items-start space-x-2 max-w-md">
                        <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 line-clamp-2">{submission.feedback}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No feedback yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-sm text-gray-600">Start working on assignments to see your submissions here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubmissions;
