import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/apiService';
import { unwrap } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('reloop_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('reloop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const updateSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('reloop_token', newToken);
    } else {
      localStorage.removeItem('reloop_token');
    }
    if (newUser) {
      localStorage.setItem('reloop_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('reloop_user');
    }
  };

  const applyAuthPayload = (res) => {
    const auth = unwrap(res);
    const accessToken = auth?.token || auth?.accessToken;
    const authUser = auth?.user;
    if (!accessToken || !authUser) {
      throw new Error('Login failed: invalid response from server');
    }
    updateSession(accessToken, authUser);
    return authUser;
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    return applyAuthPayload(res);
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    return applyAuthPayload(res);
  };

  const logout = () => {
    updateSession(null, null);
  };

  const refreshUser = async () => {
    if (!localStorage.getItem('reloop_token')) return;
    try {
      const res = await authApi.getMe();
      const nextUser = unwrap(res);
      if (nextUser) {
        setUser(nextUser);
        localStorage.setItem('reloop_user', JSON.stringify(nextUser));
      }
    } catch {
      updateSession(null, null);
    }
  };

  const loginAsDemoFarmer = async () => login('ramesh.farmer@reloop.com', 'Password@123');
  const loginAsDemoBuyer = async () => login('procurement@biocompost.com', 'Password@123');

  useEffect(() => {
    const onExpired = () => updateSession(null, null);
    window.addEventListener('reloop-auth-expired', onExpired);
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => window.removeEventListener('reloop-auth-expired', onExpired);
  }, []);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'SUPPLIER',
    isBuyer: user?.role === 'BUYER',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser,
    loginAsDemoFarmer,
    loginAsDemoBuyer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
