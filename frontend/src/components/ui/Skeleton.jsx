const Skeleton = ({ width, height, className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const styles = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={styles}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
    <div className="pt-4">
      <Skeleton height="200px" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
