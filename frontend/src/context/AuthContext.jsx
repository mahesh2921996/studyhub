/**
 * Auth Context
 * Global authentication state management
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('studyhub_token');
    const stored = localStorage.getItem('studyhub_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        // Verify token is still valid
        authService.getMe()
          .then(res => setUser(res.data.user))
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('studyhub_token', token);
    localStorage.setItem('studyhub_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('studyhub_token');
    localStorage.removeItem('studyhub_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    localStorage.setItem('studyhub_user', JSON.stringify(updated));
    setUser(updated);
  };

  const isAdmin = () => user?.role === 'admin';
  const isMember = () => user?.role === 'admin' || user?.isMember;
  const isLoggedIn = () => !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin, isMember, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
