import { useState, useEffect, useCallback } from 'react';
import { 
  getCachedLessons, 
  cacheLessons, 
  getCachedAssignments, 
  cacheAssignments,
  getCachedSubmissions,
  cacheSubmissions,
  isDataStale
} from '../utils/offlineStorage';

/**
 * Hook for managing offline data with automatic caching
 * @param {Function} fetchFunction - Function to fetch data from API
 * @param {String} cacheType - Type of cache ('lessons', 'assignments', 'submissions')
 * @param {Number} maxAgeMinutes - Maximum age of cached data in minutes
 */
export const useOfflineData = (fetchFunction, cacheType = 'lessons', maxAgeMinutes = 60) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const getCacheFunction = {
    lessons: getCachedLessons,
    assignments: getCachedAssignments,
    submissions: getCachedSubmissions,
  }[cacheType];

  const setCacheFunction = {
    lessons: cacheLessons,
    assignments: cacheAssignments,
    submissions: cacheSubmissions,
  }[cacheType];

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from network first if online
      if (navigator.onLine && !forceRefresh) {
        try {
          const result = await fetchFunction();
          const fetchedData = result?.data || result?.lessons || result?.assignments || result?.submissions || result;
          
          // Cache the fresh data
          await setCacheFunction(fetchedData);
          setData(fetchedData);
          setIsOffline(false);
          return;
        } catch (fetchError) {
          console.warn('Network fetch failed, falling back to cache:', fetchError);
        }
      }

      // Fall back to cache if offline or fetch failed
      const cachedData = await getCacheFunction();
      if (cachedData && cachedData.length > 0) {
        setData(cachedData);
        setIsOffline(true);
      } else if (!navigator.onLine) {
        setError('No cached data available and you are offline');
      } else {
        // Try one more time if we have no cache and we're online
        const result = await fetchFunction();
        const fetchedData = result?.data || result?.lessons || result?.assignments || result?.submissions || result;
        await setCacheFunction(fetchedData);
        setData(fetchedData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, getCacheFunction, setCacheFunction]);

  const refresh = useCallback(async () => {
    if (!navigator.onLine) {
      throw new Error('Cannot refresh while offline');
    }
    await loadData(true);
  }, [loadData]);

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOffline(false);
      loadData(true); // Refresh when coming back online
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  return {
    data,
    loading,
    error,
    isOffline,
    refresh
  };
};

export default useOfflineData;
