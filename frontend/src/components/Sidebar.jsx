import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, FileCode, ClipboardList, Send, Users, School, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Role-based navigation
  const navigationByRole = {
    ADMIN: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Batches', path: '/admin/batches', icon: School },
      { name: 'Lessons', path: '/admin/lessons', icon: FileCode },
      { name: 'Code Editor', path: '/code', icon: FileCode },
      { name: 'Assignments', path: '/assignments', icon: ClipboardList },
      { name: 'Submissions', path: '/submissions', icon: Send },
    ],
    INSTRUCTOR: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Lessons', path: '/instructor/lessons', icon: FileCode },
      { name: 'Assignments', path: '/instructor/assignments', icon: ClipboardList },
      { name: 'Submissions', path: '/instructor/submissions', icon: Send },
      { name: 'Code Editor', path: '/code', icon: FileCode },
      { name: 'Sections', path: '/sections', icon: School },
    ],
    STUDENT: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Code Workspace', path: '/student/code', icon: FileCode },
      { name: 'My Lessons', path: '/student/lessons', icon: FileCode },
      { name: 'Assignments', path: '/student/assignments', icon: ClipboardList },
      { name: 'My Submissions', path: '/student/submissions', icon: Send },
    ],
  };

  const navigation = navigationByRole[user?.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <ChevronLeft className="h-4 w-4 text-gray-700" />
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </div>
              <span className="font-bold text-lg text-gray-900">CodeLan</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors text-sm mb-1 ${
                    active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
