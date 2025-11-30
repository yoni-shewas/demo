import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    // Check both localStorage and sessionStorage for token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    // Check if token is expired
    const tokenExpiry = localStorage.getItem('tokenExpiry') || sessionStorage.getItem('tokenExpiry');
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      // Token expired, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('tokenExpiry');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('tokenExpiry');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;
      
      // Calculate expiry time (24 hours from now)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
      // Always save to localStorage for persistence across refreshes
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/api/admin/users', userData);
      return { 
        success: true, 
        user: response.data.user 
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('tokenExpiry');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('tokenExpiry');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
