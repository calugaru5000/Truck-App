import { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  function toggleLang() {
    const next = lang === 'en' ? 'ro' : 'en'
    localStorage.setItem('lang', next)
    setLang(next)
  }

  function t(keyPath) {
    const keys = keyPath.split('.')
    let val = translations[lang]
    for (const k of keys) {
      val = val?.[k]
    }
    if (val === undefined) {
      let fallback = translations['en']
      for (const k of keys) fallback = fallback?.[k]
      return fallback ?? keyPath
    }
    return val
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
