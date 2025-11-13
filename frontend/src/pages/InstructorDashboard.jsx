import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ClipboardList, Users, Plus, ChevronRight, Calendar } from 'lucide-react';
import * as instructorService from '../services/instructorService';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsData, assignmentsData, profileData] = await Promise.allSettled([
        instructorService.getLessons(),
        instructorService.getAssignments(),
        instructorService.getProfile(),
      ]);

      if (lessonsData.status === 'fulfilled') {
        const data = lessonsData.value?.data || lessonsData.value?.lessons || lessonsData.value || [];
        setLessons(Array.isArray(data) ? data : []);
      }

      if (assignmentsData.status === 'fulfilled') {
        const data = assignmentsData.value?.data || assignmentsData.value?.assignments || assignmentsData.value || [];
        setAssignments(Array.isArray(data) ? data : []);
      }

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:border-gray-300 transition-colors' : ''}`}
    >
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
    { name: 'Create New Lesson', icon: BookOpen, path: '/code' },
    { name: 'Create Assignment', icon: ClipboardList, path: '/assignments' },
    { name: 'View Students', icon: Users, path: '/students' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {user?.firstName || 'Instructor'}. Manage your lessons and assignments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Lessons"
          value={lessons.length}
          icon={BookOpen}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Assignments"
          value={assignments.filter((a) => new Date(a.dueDate) > new Date()).length}
          icon={ClipboardList}
          color="bg-green-500"
        />
        <StatCard
          title="Total Assignments"
          value={assignments.length}
          icon={ClipboardList}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lessons */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Lessons</h2>
              <p className="text-sm text-gray-600 mt-1">Your latest teaching materials</p>
            </div>
            <button 
              onClick={() => navigate('/code')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {lessons.slice(0, 5).map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                  Edit <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No lessons yet. Create your first lesson!</p>
                <button
                  onClick={() => navigate('/code')}
                  className="mt-4 inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Lesson</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Quick Links</h2>
            <p className="text-sm text-gray-600 mt-1">Frequently used actions</p>
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
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upcoming Assignments</h2>
            <p className="text-sm text-gray-600 mt-1">Assignments with upcoming deadlines</p>
          </div>
          <button
            onClick={() => navigate('/assignments')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments
            .filter((a) => new Date(a.dueDate) > new Date())
            .slice(0, 6)
            .map((assignment) => (
              <div
                key={assignment.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 flex-1">
                    {assignment.title}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {assignment.description}
                </p>
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          {assignments.filter((a) => new Date(a.dueDate) > new Date()).length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No upcoming assignments. Create one to get started!</p>
              <button
                onClick={() => navigate('/assignments')}
                className="mt-4 inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Assignment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
