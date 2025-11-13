import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden hover:bg-gray-100 rounded-md p-2"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="hover:bg-gray-100 rounded-md p-2 relative">
              <Bell className="h-5 w-5 text-gray-700" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.email?.split('@')[0]}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="hover:bg-gray-100 rounded-md p-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
