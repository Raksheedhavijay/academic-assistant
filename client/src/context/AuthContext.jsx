import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('academic_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('academic_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('academic_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('Failed to restore user session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('academic_token', data.token);
      localStorage.setItem('academic_user', JSON.stringify(data.user));
    }
    return data;
  };

  const signup = async (userData) => {
    const { data } = await API.post('/auth/signup', userData);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('academic_token', data.token);
      localStorage.setItem('academic_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('academic_token');
    localStorage.removeItem('academic_user');
  };

  const updateUserProfile = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('academic_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
