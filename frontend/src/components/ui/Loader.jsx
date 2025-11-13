import { Loader as LoaderIcon } from 'lucide-react';

const Loader = ({ size = 'md', text, fullScreen = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      <LoaderIcon className={`animate-spin text-gray-900 ${sizes[size]}`} />
      {text && <p className="text-gray-600 mt-4">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizes[size]} ${className}`} />
  );
};

export default Loader;
