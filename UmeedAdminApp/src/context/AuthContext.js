import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { setAuthFailureHandler, clearStoredAuth, getApiErrorMessage } from '../api/apiHandler';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (token && savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.role === 'admin') {
            // Validate token against backend; invalid/expired -> clear and show login
            try {
              const { data } = await api.get('/auth/me');
              if (data?.role === 'admin') {
                setUser({ ...parsed, ...data });
              } else {
                await clearStoredAuth();
              }
            } catch (e) {
              await clearStoredAuth();
            }
          } else {
            await clearStoredAuth();
          }
        }
      } catch (e) {
        await clearStoredAuth();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setAuthFailureHandler(async () => {
      try {
        await clearStoredAuth();
      } finally {
        setUser(null);
      }
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.role !== 'admin') {
        const err = new Error('Access denied. This account is not an admin account.');
        err.response = { data: { message: err.message } };
        throw err;
      }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (e) {
      const msg = e?.response?.data?.message || e.userMessage || e.message || 'Login failed';
      const err = new Error(msg);
      err.response = e.response;
      throw err;
    }
  };

  const logout = async () => {
    try {
      await clearStoredAuth();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
