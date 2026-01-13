import i18n from '../localization/i18';
import { useLanguage } from '../context/LanguageContext';
import { useEffect } from 'react';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  // Update i18n locale when language changes
  useEffect(() => {
    i18n.locale = language;
  }, [language]);
  
  return {
    t: (key: string) => i18n.t(key),
    language,
  };
};
