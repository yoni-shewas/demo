const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const inputClasses = `
    w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input className={inputClasses} {...props} />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const textareaClasses = `
    w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea className={textareaClasses} {...props} />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  helperText,
  options = [],
  fullWidth = true,
  className = '',
  ...props
}) => {
  const selectClasses = `
    w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select className={selectClasses} {...props}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;
