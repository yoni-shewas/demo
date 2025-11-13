import { useState, useEffect, useRef } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.png',
  onLoad,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        if (onLoad) onLoad();
      };

      img.onerror = () => {
        setIsLoading(false);
        console.error('Failed to load image:', src);
      };
    }
  }, [isInView, src, onLoad]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
