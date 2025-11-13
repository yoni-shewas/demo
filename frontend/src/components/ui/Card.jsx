const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
  ...props 
}) => {
  const cardClasses = `
    bg-white rounded-lg border border-gray-200 overflow-hidden
    ${hoverable ? 'hover:shadow-lg transition-shadow' : ''}
    ${clickable ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>{children}</div>
);

export default Card;
