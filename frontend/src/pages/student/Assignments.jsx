import { useState, useEffect } from 'react';
import { ClipboardList, Upload, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, submissionsData] = await Promise.allSettled([
        studentService.getAssignments(),
        studentService.getSubmissions(),
      ]);

      if (assignmentsData.status === 'fulfilled') {
        setAssignments(assignmentsData.value.assignments || assignmentsData.value || []);
      }

      if (submissionsData.status === 'fulfilled') {
        setSubmissions(submissionsData.value.submissions || submissionsData.value || []);
      }

      toast.success('Assignments loaded');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const hasSubmitted = (assignmentId) => {
    return submissions.some((s) => s.assignmentId === assignmentId);
  };

  const getSubmission = (assignmentId) => {
    return submissions.find((s) => s.assignmentId === assignmentId);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-sm text-gray-600 mt-1">View and submit your assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => {
          const submitted = hasSubmitted(assignment.id);
          const submission = getSubmission(assignment.id);
          const overdue = isOverdue(assignment.dueDate);
          const daysLeft = getDaysRemaining(assignment.dueDate);

          return (
            <div key={assignment.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{assignment.title}</h3>
                  {submitted ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                  ) : overdue ? (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 ml-2" />
                  ) : (
                    <ClipboardList className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                {assignment.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                  </div>
                  
                  {!overdue && !submitted && (
                    <div className="text-sm">
                      <span className={`font-semibold ${daysLeft <= 2 ? 'text-red-600' : 'text-blue-600'}`}>
                        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining
                      </span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    Max Points: <span className="font-semibold text-gray-900">{assignment.maxPoints || 100}</span>
                  </div>
                </div>

                {submitted && submission && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Submitted on {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    {submission.grade !== null && submission.grade !== undefined && (
                      <p className="text-sm text-green-800 mt-1">
                        <strong>Grade: {submission.grade}/{assignment.maxPoints || 100}</strong>
                      </p>
                    )}
                  </div>
                )}

                {overdue && !submitted && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">⚠ This assignment is overdue</p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/student/code')}
                  disabled={submitted && overdue}
                  className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                    submitted
                      ? 'bg-gray-100 text-gray-600 cursor-default'
                      : overdue
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Submitted</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Start Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
            <p className="text-sm text-gray-600">Your instructor hasn't posted any assignments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
