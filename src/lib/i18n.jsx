import React, { createContext, useContext, useEffect, useState } from "react";
import { setLangStore } from "@/lib/lang";

const LangCtx = createContext(null);
const STORAGE_KEY = "jadara_lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    let l = "ar";
    try {
      l = localStorage.getItem(STORAGE_KEY) || "ar";
    } catch (e) {}
    setLangStore(l);
    return l;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    } catch (e) {}
    setLangStore(lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  return (
    <LangCtx.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LangCtx);
  if (!ctx) return { lang: "ar", setLang: () => {}, toggle: () => {} };
  return ctx;
}