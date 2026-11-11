import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadDraft = async (key, fallback = null) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

export const saveDraft = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // non-blocking
  }
};

export const clearDraft = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // non-blocking
  }
};
