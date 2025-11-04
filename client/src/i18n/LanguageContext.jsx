import React, { createContext, useState, useEffect, useContext } from 'react'
import { getLanguage } from './translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [translations, setTranslations] = useState(getLanguage('en'))

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLang = localStorage.getItem('menuLanguage')
    if (savedLang) {
      changeLanguage(savedLang)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] // e.g., 'en-US' -> 'en'
      const supportedLangs = ['en', 'fr', 'es', 'ar', 'de']
      if (supportedLangs.includes(browserLang)) {
        changeLanguage(browserLang)
      }
    }
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    setTranslations(getLanguage(lang))
    localStorage.setItem('menuLanguage', lang)
    
    // Set HTML dir attribute for RTL languages
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = lang
    }
  }

  return (
    <LanguageContext.Provider value={{ language, currentLanguage: language, translations, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
