import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bm';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  getText: (en: string, bm: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bm' : 'en');
  };

  const getText = (en: string, bm: string) => language === 'en' ? en : bm;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, getText }}>
      {children}
    </LanguageContext.Provider>
  );
};