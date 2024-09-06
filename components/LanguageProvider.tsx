'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Language = 'en' | 'zh' | 'fr' | 'ru' | 'es' | 'hi' | 'de'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
    const newPathname = pathname.replace(/^\/[a-z]{2}-[a-z]{2}/, `/${language}-${language}`)
    router.push(newPathname)
  }, [language, pathname, router])

  const t = (key: string) => {
    // This is a simple translation function. In a real application, you'd use a more robust i18n solution.
    const translations: Record<Language, Record<string, string>> = {
        en: {
            'Tools': 'Tools',
            'Manage Tools': 'Manage Tools',
            'Tool 1': 'Tool 1',
            'Tool 2': 'Tool 2',
            'Tool 3': 'Tool 3',
            'Manage Tool 1': 'Manage Tool 1',
            'Manage Tool 2': 'Manage Tool 2',
            'Manage Tool 3': 'Manage Tool 3',
        },
        zh: {
            'Tools': '工具',
            'Manage Tools': '管理工具',
            'Tool 1': '工具1',
            'Tool 2': '工具2',
            'Tool 3': '工具3',
            'Manage Tool 1': '管理工具1',
            'Manage Tool 2': '管理工具2',
            'Manage Tool 3': '管理工具3',
        },
        fr: {},
        ru: {},
        es: {},
        hi: {},
        de: {}
    }

    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}