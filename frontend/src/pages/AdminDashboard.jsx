import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, School, BookOpen, ChevronRight, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import * as adminService from '../services/adminService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, sectionsData, lessonsData] = await Promise.allSettled([
        adminService.getAllUsers(),
        adminService.getAllSections(),
        adminService.getAllLessons(),
      ]);

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value.users || usersData.value || []);
      }

      if (sectionsData.status === 'fulfilled') {
        setSections(sectionsData.value.sections || sectionsData.value.data?.sections || []);
      }

      if (lessonsData.status === 'fulfilled') {
        setLessons(lessonsData.value.lessons || lessonsData.value.data?.lessons || []);
      }

      toast.success('Dashboard loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { name: 'Manage Users', path: '/admin/users', icon: Users, description: 'Add, edit, and manage all users', color: 'bg-blue-500' },
    { name: 'Manage Batches', path: '/admin/batches', icon: School, description: 'Create sections and assign users', color: 'bg-green-500' },
    { name: 'View Lessons', path: '/admin/lessons', icon: BookOpen, description: 'Browse all instructor materials', color: 'bg-purple-500' },
  ];

  const StatCard = ({ title, value, icon: Icon, color, onClick, trend }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all hover:border-gray-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.firstName || 'Admin'}. Manage your CodeLan LMS system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/admin/users')}
          trend="+12% from last month"
        />
        <StatCard
          title="Instructors"
          value={users.filter((u) => u.role === 'INSTRUCTOR').length}
          icon={Activity}
          color="bg-gradient-to-br from-green-500 to-green-600"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Students"
          value={users.filter((u) => u.role === 'STUDENT').length}
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          onClick={() => navigate('/admin/users')}
          trend="+8% from last month"
        />
        <StatCard
          title="Sections/Batches"
          value={sections.length}
          icon={School}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          onClick={() => navigate('/admin/batches')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your system</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all text-left group"
              >
                <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">System Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Current system status</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Lessons</p>
                <p className="text-xs text-gray-600 mt-1">Created by instructors</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">{lessons.length}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Active Sections</p>
                <p className="text-xs text-gray-600 mt-1">Course batches</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">{sections.length}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Admin Users</p>
                <p className="text-xs text-gray-600 mt-1">System administrators</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'ADMIN').length}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
              <p className="text-sm text-gray-600 mt-1">Latest registered users</p>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{u.email}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    u.role === 'ADMIN'
                      ? 'bg-red-100 text-red-800'
                      : u.role === 'INSTRUCTOR'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
