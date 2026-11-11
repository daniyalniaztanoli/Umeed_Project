import AsyncStorage from '@react-native-async-storage/async-storage';

let authFailureHandler = null;

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;
};

export const notifyAuthFailure = async () => {
  if (typeof authFailureHandler === 'function') {
    try {
      await authFailureHandler();
    } catch (e) {}
  }
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  if (error.userMessage) return error.userMessage;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'Request timed out. Please check your connection and try again.';
  }
  if (error.isNetworkError || error.message === 'Network Error' || !error.response) {
    const base = error?.config?.baseURL || error?.baseURL;
    if (__DEV__ && base) {
      return `Unable to reach server (${base}). Start backend on port 5000 and run: adb reverse tcp:5000 tcp:5000`;
    }
    return base ? `Unable to reach server (${base}). Check your internet connection.` : 'Unable to reach the server. Please check your internet connection.';
  }
  return fallback;
};

export const clearStoredAuth = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
};
