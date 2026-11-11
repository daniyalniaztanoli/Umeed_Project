import { createContext, useState, useEffect } from 'react';
import api from '../api/api';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (token && savedUser) setUser(JSON.parse(savedUser));
      } catch {}
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.role !== 'admin' && res.data.role !== 'finance_officer') {
        Alert.alert('Access denied', 'Admin only.');
        return false;
      }

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return true;
    } catch (error) {
      Alert.alert('Login failed', error.response?.data?.message || 'Invalid credentials');
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
