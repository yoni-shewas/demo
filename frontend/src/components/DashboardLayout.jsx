import { useAuth } from '../context/AuthContext';

/**
 * Shared dashboard layout wrapper
 * Provides consistent styling and structure for all role-based dashboards
 */
const DashboardLayout = ({ children, title, description, actions }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {user?.role && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-red-100 text-red-800'
                    : user.role === 'INSTRUCTOR'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {user.role}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>

      {/* Main Content */}
      <div>{children}</div>
    </div>
  );
};

/**
 * Dashboard Section Component
 * Reusable section wrapper with consistent styling
 */
export const DashboardSection = ({ title, description, children, actions, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}
      <div className={title || description || actions ? 'p-6' : ''}>{children}</div>
    </div>
  );
};

/**
 * Stat Card Component
 * Displays a metric with an icon
 */
export const StatCard = ({ title, value, icon: Icon, color, onClick, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 ${
        onClick ? 'cursor-pointer hover:border-gray-300 transition-colors' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color] || color || 'bg-gray-500'}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Empty State Component
 * Shows when no data is available
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-12 text-gray-500">
      {Icon && <Icon className="h-16 w-16 mx-auto mb-4 text-gray-400" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

/**
 * Badge Component
 * For status indicators
 */
export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export default DashboardLayout;
