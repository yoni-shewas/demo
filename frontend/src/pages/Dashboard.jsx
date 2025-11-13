import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Route to role-specific dashboard
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'INSTRUCTOR':
      return <InstructorDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">
            Unable to determine user role. Please contact support.
          </div>
        </div>
      );
  }
};

export default Dashboard;
