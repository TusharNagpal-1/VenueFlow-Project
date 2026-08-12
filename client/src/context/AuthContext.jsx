import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

const normalizeStoredAuth = () => {
  try {
    const savedUser = localStorage.getItem('userInfo');
    const savedToken = localStorage.getItem('token');

    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser);
    const token = savedToken || parsedUser?.token;

    if (!token) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      return null;
    }

    const normalizedUser = { ...parsedUser, token };
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
    localStorage.setItem('token', token);
    return normalizedUser;
  } catch (error) {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = normalizeStoredAuth();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const setAuthSession = (data) => {
    if (!data?.token) {
      throw new Error('Authentication token missing');
    }

    const authUser = { ...data };
    localStorage.setItem('userInfo', JSON.stringify(authUser));
    localStorage.setItem('token', authUser.token);
    setUser(authUser);
    return authUser;
  };

  const login = async (email, password, role) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      return setAuthSession(data);
    } catch (error) {
      if (error.response?.data?.needsVerification) throw error.response.data;
      const err = new Error(error.response?.data?.message || 'Login failed');
      err.status = error.response?.status;
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      return setAuthSession(data);
    } catch (error) {
      throw error.response?.data?.message || 'OTP verification failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOTP, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
