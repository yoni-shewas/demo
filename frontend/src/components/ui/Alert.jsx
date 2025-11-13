import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ 
  variant = 'info', 
  title, 
  children, 
  onClose, 
  icon: CustomIcon,
  className = '' 
}) => {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
    },
  };

  const { bg, border, text, icon: DefaultIcon } = variants[variant];
  const Icon = CustomIcon || DefaultIcon;

  return (
    <div className={`${bg} border ${border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${text} flex-shrink-0 mt-0.5`} />
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${text} mb-1`}>{title}</h3>}
          <div className={`text-sm ${text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${text} hover:opacity-75 flex-shrink-0`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
