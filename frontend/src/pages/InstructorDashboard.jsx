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
  const [sections, setSections] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsData, assignmentsData, sectionsData, profileData] = await Promise.allSettled([
        instructorService.getLessons(),
        instructorService.getAssignments(),
        instructorService.getSections(),
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

      if (sectionsData.status === 'fulfilled') {
        const data = sectionsData.value?.data || sectionsData.value?.sections || sectionsData.value || [];
        setSections(Array.isArray(data) ? data : []);
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
          Welcome back, {user?.firstName || 'Instructor'}. Manage your semester sections, lessons, and assignments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="My Sections"
          value={sections.length}
          icon={Users}
          color="bg-indigo-500"
        />
        <StatCard
          title="Total Students"
          value={sections.reduce((sum, s) => sum + (s._count?.students || 0), 0)}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Lessons"
          value={lessons.length}
          icon={BookOpen}
          color="bg-green-500"
        />
        <StatCard
          title="Total Assignments"
          value={assignments.length}
          icon={ClipboardList}
          color="bg-purple-500"
        />
      </div>

      {/* Assigned Sections */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Assigned Sections</h2>
          <p className="text-sm text-gray-600 mt-1">Sections you're teaching this semester</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{section.name}</h3>
                  {section.batch && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        {section.batch.name}
                      </span>
                      <span className="text-xs text-gray-600">
                        {section.batch.type} - {section.batch.year} E.C.
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{section._count?.students || 0}</div>
                  <div className="text-xs text-gray-600">Students</div>
                </div>
              </div>

              {/* Students List */}
              {section.students && section.students.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Students:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {section.students.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            {student.user?.firstName?.charAt(0)}{student.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-700">
                          {student.user?.firstName} {student.user?.lastName}
                        </span>
                        {student.studentId && (
                          <span className="text-gray-500">({student.studentId})</span>
                        )}
                      </div>
                    ))}
                    {section.students.length > 5 && (
                      <p className="text-xs text-gray-500 italic">
                        +{section.students.length - 5} more students
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Assignments Count */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <span>{section._count?.assignments || 0} Assignments</span>
                <span>{section._count?.lessons || 0} Lessons</span>
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700">No Sections Assigned</p>
              <p className="text-sm text-gray-500 mt-2">
                Contact an administrator to be assigned to sections
              </p>
            </div>
          )}
        </div>
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
                {assignment.section && (
                  <div className="mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {assignment.section.name}
                    </span>
                    {assignment.section.batch && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({assignment.section.batch.name})
                      </span>
                    )}
                  </div>
                )}
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
