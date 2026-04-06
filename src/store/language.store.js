import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'app_language';

const useLanguageStore = create((set) => ({
  language: 'en',
  
  setLanguage: async (lang) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    set({ language: lang });
  },

  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) {
      set({ language: saved });
    }
  },
}));

export default useLanguageStore;
