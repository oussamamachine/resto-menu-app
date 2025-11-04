import React, { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { languageNames } from '../i18n/translations'

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', flag: '🇬🇧', name: languageNames.en },
    { code: 'fr', flag: '🇫🇷', name: languageNames.fr },
    { code: 'es', flag: '🇪🇸', name: languageNames.es },
    { code: 'ar', flag: '🇸🇦', name: languageNames.ar },
    { code: 'de', flag: '🇩🇪', name: languageNames.de }
  ]

  const currentLang = languages.find(lang => lang.code === language)

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200"
      >
        <span className="text-xl">{currentLang?.flag}</span>
        <span className="text-sm font-medium text-gray-700">{currentLang?.code.toUpperCase()}</span>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[160px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'bg-[#d4825c]/10' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium text-gray-800">{lang.name}</div>
                  <div className="text-xs text-gray-500">{lang.code.toUpperCase()}</div>
                </div>
                {language === lang.code && (
                  <span className="text-[#d4825c]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
