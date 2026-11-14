import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import hi from '../i18n/hi.json';
import api from '../services/api';

export type Language = 'en' | 'ta' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, any> = { en, ta, hi };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('patchshield_lang') as Language) || 'en';
  });

  // On mount, if user is logged in, sync language from user preferences
  useEffect(() => {
    const fetchUserLang = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/auth/me/language');
          if (res.data?.preferred_language && ['en', 'ta', 'hi'].includes(res.data.preferred_language)) {
            setLanguageState(res.data.preferred_language as Language);
            localStorage.setItem('patchshield_lang', res.data.preferred_language);
          }
        }
      } catch (e) {
        // Fallback to localStorage
      }
    };
    fetchUserLang();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('patchshield_lang', lang);
    const token = localStorage.getItem('token');
    if (token) {
      api.patch('/auth/me/language', { language: lang }).catch(() => {});
    }
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current = dictionaries[language];
    let found = true;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        found = false;
        break;
      }
    }

    let result = (found && typeof current === 'string') ? current : '';

    if (!result) {
      // Fallback to English
      let fallback = dictionaries['en'];
      for (const fbKey of keys) {
        if (fallback && typeof fallback === 'object' && fbKey in fallback) {
          fallback = fallback[fbKey];
        } else {
          return path;
        }
      }
      result = typeof fallback === 'string' ? fallback : path;
    }

    if (params && typeof result === 'string') {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      }
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
