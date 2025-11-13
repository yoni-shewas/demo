// Offline storage utilities for caching data
const DB_NAME = 'CodeLanDB';
const DB_VERSION = 1;
const STORES = {
  LESSONS: 'lessons',
  ASSIGNMENTS: 'assignments',
  SUBMISSIONS: 'submissions',
  USER_DATA: 'userData'
};

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.LESSONS)) {
        db.createObjectStore(STORES.LESSONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.ASSIGNMENTS)) {
        db.createObjectStore(STORES.ASSIGNMENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SUBMISSIONS)) {
        db.createObjectStore(STORES.SUBMISSIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }
    };
  });
};

// Generic save function
export const saveToCache = async (storeName, data) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
};

// Generic get function
export const getFromCache = async (storeName, key = null) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    if (key) {
      const request = store.get(key);
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else {
      const request = store.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
};

// Delete from cache
export const deleteFromCache = async (storeName, key) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error deleting from cache:', error);
    return false;
  }
};

// Clear entire store
export const clearCache = async (storeName) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Specific functions for common operations
export const cacheLessons = (lessons) => saveToCache(STORES.LESSONS, lessons);
export const getCachedLessons = () => getFromCache(STORES.LESSONS);

export const cacheAssignments = (assignments) => saveToCache(STORES.ASSIGNMENTS, assignments);
export const getCachedAssignments = () => getFromCache(STORES.ASSIGNMENTS);

export const cacheSubmissions = (submissions) => saveToCache(STORES.SUBMISSIONS, submissions);
export const getCachedSubmissions = () => getFromCache(STORES.SUBMISSIONS);

export const cacheUserData = (key, data) => saveToCache(STORES.USER_DATA, { key, data, timestamp: Date.now() });
export const getCachedUserData = (key) => getFromCache(STORES.USER_DATA, key);

// Check if data is stale (older than specified minutes)
export const isDataStale = (cachedData, maxAgeMinutes = 60) => {
  if (!cachedData || !cachedData.timestamp) return true;
  const ageMinutes = (Date.now() - cachedData.timestamp) / (1000 * 60);
  return ageMinutes > maxAgeMinutes;
};

export default {
  saveToCache,
  getFromCache,
  deleteFromCache,
  clearCache,
  cacheLessons,
  getCachedLessons,
  cacheAssignments,
  getCachedAssignments,
  cacheSubmissions,
  getCachedSubmissions,
  cacheUserData,
  getCachedUserData,
  isDataStale
};
