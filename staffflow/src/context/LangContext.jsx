import { createContext, useContext, useState } from 'react';
import uz from '../locales/uz.json';
import en from '../locales/en.json';

const locales = { uz, en };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sf_lang') || 'uz');

  const switchLang = (l) => {
    localStorage.setItem('sf_lang', l);
    setLang(l);
  };

  return (
    <LangContext.Provider value={{ lang, switchLang, translations: locales[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
