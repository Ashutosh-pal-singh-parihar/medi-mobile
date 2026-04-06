import { useEffect } from 'react';
import useLanguageStore from '../store/language.store';
import { STRINGS } from '../config/strings';

export function useLanguage() {
  const { language, setLanguage, loadLanguage } = useLanguageStore();

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const t = (key) => {
    // Return translation if exists, otherwise fallback to English, otherwise the key itself
    return STRINGS[language]?.[key] || STRINGS['en']?.[key] || key;
  };

  return { language, setLanguage, t, isHindi: language === 'hi' };
}
