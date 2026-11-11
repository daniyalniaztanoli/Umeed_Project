import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notifyAuthFailure, getApiErrorMessage } from './apiHandler';

// Local backend for debug builds (Android emulator; requires: adb reverse tcp:5000 tcp:5000)
export const LOCAL_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
// Production backend URL (HTTPS). Set to deployed backend for release APKs.
export const PROD_BASE_URL = 'https://backend-xi-fawn-47.vercel.app/api';

// Debug -> local backend, Release -> production backend
export const BASE_URL = __DEV__ ? LOCAL_BASE_URL : PROD_BASE_URL;
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
