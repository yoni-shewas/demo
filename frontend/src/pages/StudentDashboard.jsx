import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileCode, ClipboardList, Send, Trophy, ChevronRight, Calendar, CheckCircle, Clock } from 'lucide-react';
import * as studentService from '../services/studentService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, submissionsData, lessonsData] = await Promise.allSettled([
        studentService.getAssignments(),
        studentService.getSubmissions(),
        studentService.getLessons(),
      ]);

      if (assignmentsData.status === 'fulfilled') {
        const data = assignmentsData.value?.data || assignmentsData.value?.assignments || assignmentsData.value || [];
        setAssignments(Array.isArray(data) ? data : []);
      }

      if (submissionsData.status === 'fulfilled') {
        const data = submissionsData.value?.data || submissionsData.value?.submissions || submissionsData.value || [];
        setSubmissions(Array.isArray(data) ? data : []);
      }

      if (lessonsData.status === 'fulfilled') {
        const data = lessonsData.value?.data || lessonsData.value?.lessons || lessonsData.value || [];
        setLessons(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const quickLinks = [
    { name: 'Start Coding', icon: FileCode, path: '/code' },
    { name: 'View Assignments', icon: ClipboardList, path: '/assignments' },
    { name: 'My Submissions', icon: Send, path: '/submissions' },
  ];

  const getPendingAssignments = () => {
    if (!Array.isArray(submissions) || !Array.isArray(assignments)) return [];
    const submitted = submissions.map((s) => s.assignmentId);
    return assignments.filter((a) => !submitted.includes(a.id) && new Date(a.dueDate) > new Date());
  };

  const getCompletedAssignments = () => {
    if (!Array.isArray(submissions)) return [];
    return submissions.filter((s) => s.status === 'COMPLETED' || s.score !== null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const pendingAssignments = getPendingAssignments();
  const completedCount = getCompletedAssignments().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {user?.firstName || 'Student'}. Here's your progress overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Assignments"
          value={assignments.length}
          icon={ClipboardList}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending"
          value={pendingAssignments.length}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Total Submissions"
          value={submissions.length}
          icon={Send}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Assignments */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pending Assignments</h2>
              <p className="text-sm text-gray-600 mt-1">Assignments you need to complete</p>
            </div>
            <button
              onClick={() => navigate('/assignments')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingAssignments.slice(0, 5).map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const today = new Date();
              const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 2;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{assignment.title}</h3>
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due {dueDate.toLocaleDateString()} ({daysLeft} days left)
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isUrgent && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                        Urgent
                      </span>
                    )}
                    <button
                      onClick={() => navigate('/code')}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                    >
                      Start <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingAssignments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Great! No pending assignments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Quick Links</h2>
            <p className="text-sm text-gray-600 mt-1">Frequently used resources</p>
          </div>

          <div className="space-y-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">{link.name}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Overall Progress</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Completion Rate</span>
              <span className="text-xs font-semibold text-gray-900">
                {assignments.length > 0 
                  ? Math.round((completedCount / assignments.length) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-black h-2 rounded-full transition-all"
                style={{
                  width: `${assignments.length > 0 
                    ? (completedCount / assignments.length) * 100 
                    : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Submissions</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest assignment submissions</p>
          </div>
          <button
            onClick={() => navigate('/submissions')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.slice(0, 5).map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignments.find((a) => a.id === submission.assignmentId)?.title || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'COMPLETED' || submission.grade
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {submission.status === 'COMPLETED' || submission.grade ? 'Graded' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {submission.grade || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Send className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No submissions yet. Start working on assignments!</p>
            <button
              onClick={() => navigate('/code')}
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Coding
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
