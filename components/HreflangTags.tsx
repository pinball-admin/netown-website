'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useI18n, Language } from '@/contexts/I18nContext'

const SUPPORTED_LOCALES: Language[] = ['en', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'zh']
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://football.netown.cn'

export default function HreflangTags() {
  const { language } = useI18n()
  const pathname = usePathname()

  useEffect(() => {
    // Extract clean path (remove any locale prefix from the URL)
    const pathParts = pathname.split('/').filter(Boolean)
    const cleanPath = SUPPORTED_LOCALES.includes(pathParts[0] as Language)
      ? '/' + pathParts.slice(1).join('/')
      : pathname

    // Remove existing auto-injected hreflang/canonical tags
    document.querySelectorAll(
      'link[rel="alternate"][hreflang], link[rel="canonical"]'
    ).forEach(el => el.remove())

    // Insert canonical tag
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = `${BASE_URL}/${language}${cleanPath}`
    document.head.appendChild(canonical)

    // Insert hreflang for each supported locale
    SUPPORTED_LOCALES.forEach(lang => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = lang
      link.href = `${BASE_URL}/${lang}${cleanPath === '/' ? '' : cleanPath}`
      document.head.appendChild(link)
    })

    // x-default hreflang (always points to English)
    const xdefault = document.createElement('link')
    xdefault.rel = 'alternate'
    xdefault.hreflang = 'x-default'
    xdefault.href = `${BASE_URL}/en${cleanPath === '/' ? '' : cleanPath}`
    document.head.appendChild(xdefault)
  }, [language, pathname])

  return null
}
