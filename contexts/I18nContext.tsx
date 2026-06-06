'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import type { Translation } from '@/libs/i18n/types'

// English is always loaded statically as the instant fallback
import en from '@/libs/i18n/en'

export type Language = 'en' | 'es' | 'de' | 'it' | 'ja' | 'ko' | 'pt' | 'zh'

export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
}

export const languages: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
]

// Dynamic import map — only the requested language file is loaded
const langModules: Record<Language, () => Promise<Translation>> = {
  en: () => Promise.resolve(en),
  es: () => import('@/libs/i18n/es').then(m => m.default),
  de: () => import('@/libs/i18n/de').then(m => m.default),
  it: () => import('@/libs/i18n/it').then(m => m.default),
  ja: () => import('@/libs/i18n/ja').then(m => m.default),
  ko: () => import('@/libs/i18n/ko').then(m => m.default),
  pt: () => import('@/libs/i18n/pt').then(m => m.default),
  zh: () => import('@/libs/i18n/zh').then(m => m.default),
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
  tTeam: (teamKey: string) => string
  languages: LanguageInfo[]
  i18nReady: boolean
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, _params?: Record<string, string>) => key,
  tTeam: (teamKey: string) => teamKey,
  languages: [],
  i18nReady: false,
})

const SUPPORTED_LOCALES: Language[] = ['en', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'zh']

export function I18nProvider({ children }: { children: ReactNode }) {
  // ALWAYS start with 'en' for SSR + first client render (hydration)
  // This ensures NO hydration mismatch — server and client render the same HTML
  // After hydration, a useEffect runs to detect the correct language and switch
  const [language, setLanguage] = useState<Language>('en')

  const [mounted, setMounted] = useState(false)

  // Active translations + loading state
  const [activeTranslations, setActiveTranslations] = useState<Translation>(en)
  const [i18nReady, setI18nReady] = useState(language === 'en')
  const loadingRef = useRef<Language | null>(null)

  // Load translations for the current language
  const loadLanguage = useCallback(async (lang: Language) => {
    // Skip if already loading this language
    if (loadingRef.current === lang) return
    loadingRef.current = lang

    try {
      const t = await langModules[lang]()
      // Only apply if this is still the current language
      if (loadingRef.current === lang) {
        setActiveTranslations(t)
        setI18nReady(true)
      }
    } catch {
      // Fallback to English on error
      if (loadingRef.current === lang) {
        setActiveTranslations(en)
        setI18nReady(true)
      }
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadLanguage(language)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // After hydration, detect the correct language from URL / localStorage / geo
  useEffect(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    const urlLocale = pathParts[0] as Language
    if (SUPPORTED_LOCALES.includes(urlLocale)) {
      localStorage.setItem('netown_language', urlLocale)
      setLanguage(urlLocale)
      if (urlLocale !== 'en') loadLanguage(urlLocale)
    } else {
      // Check saved preference
      const saved = localStorage.getItem('netown_language') as Language | null
      if (saved && saved !== 'en' && langModules[saved]) {
        setLanguage(saved)
        loadLanguage(saved)
      }
    }
    setMounted(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [geoChecked, setGeoChecked] = useState(false)

  useEffect(() => {
    if (geoChecked) return

    const detectAndSetLanguage = async () => {
      const saved = localStorage.getItem('netown_language')
      if (saved) {
        setGeoChecked(true)
        return
      }

      try {
        const response = await fetch('/api/geo/info')
        if (response.ok) {
          const data = await response.json()
          const isCN = data.isCN === true
          localStorage.setItem('netown_is_cn', String(isCN))
          const detectedLang: Language = isCN ? 'zh' : 'en'
          setLanguage(detectedLang)
          localStorage.setItem('netown_language', detectedLang)
          loadLanguage(detectedLang)
        }
      } catch {
        const browserLang = navigator.language.toLowerCase()
        if (browserLang.startsWith('zh')) {
          localStorage.setItem('netown_is_cn', 'true')
          setLanguage('zh')
          localStorage.setItem('netown_language', 'zh')
          loadLanguage('zh')
        }
      } finally {
        setGeoChecked(true)
      }
    }

    detectAndSetLanguage()
  }, [geoChecked, loadLanguage])

  const getNestedValue = (obj: Translation, path: string): string => {
    const keys = path.split('.')
    let current: Translation | string = obj
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key] as Translation | string
      } else {
        return path
      }
    }
    return typeof current === 'string' ? current : path
  }

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
    setI18nReady(lang === 'en')
    if (typeof window !== 'undefined') {
      localStorage.setItem('netown_language', lang)
      // Navigate to locale-prefixed URL (full page load to sync with middleware)
      const pathParts = window.location.pathname.split('/').filter(Boolean)
      if (SUPPORTED_LOCALES.includes(pathParts[0] as Language)) {
        // Replace existing locale prefix
        pathParts[0] = lang
        window.location.href = '/' + pathParts.join('/') + window.location.search
      } else {
        // Add locale prefix
        window.location.href = '/' + lang + window.location.pathname + window.location.search
      }
    }
    if (lang !== 'en') loadLanguage(lang)
  }, [loadLanguage])

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    if (!key || typeof key !== 'string') return key || ''
    let value = getNestedValue(activeTranslations, key)
    if (value === key && language !== 'en') {
      const enValue = getNestedValue(en, key)
      value = enValue !== key ? enValue : key
    }
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        value = (value as string).replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return value
  }, [activeTranslations, language])

  const tTeam = useCallback((teamKey: string): string => {
    return t(`teams.${teamKey}`)
  }, [t])

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t, tTeam, languages, i18nReady }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
