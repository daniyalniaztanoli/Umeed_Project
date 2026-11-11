import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { setAuthFailureHandler, clearStoredAuth } from '../api/apiHandler';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (token && savedUser) setUser(JSON.parse(savedUser));
      } catch (e) {
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        await new Promise((r) => setTimeout(r, 3000));
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
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const { data } = await api.post('/auth/register', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await clearStoredAuth();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
