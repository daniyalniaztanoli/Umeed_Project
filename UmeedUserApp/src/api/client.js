import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notifyAuthFailure, getApiErrorMessage } from './apiHandler';

// ⚠️ CHANGE THIS: Use your computer's IP (not localhost) or deployed URL
// Windows: ipconfig | Mac/Linux: ifconfig
// Example: http://192.168.100.210:5000/api
export const BASE_URL = 'http://192.168.100.210:5000/api';
export const REQUEST_TIMEOUT = 15000;

const api = axios.create({ baseURL: BASE_URL, timeout: REQUEST_TIMEOUT });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await notifyAuthFailure();
    }
    if (!error.response && !error.code && error.message === 'Network Error') {
      error.isNetworkError = true;
    }
    if (!error.response && error.request) {
      error.isNetworkError = true;
    }
    error.userMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  }
);

export default api;
