'use client'

import { useI18n } from '@/contexts/I18nContext'
import { useEffect } from 'react'

/**
 * Syncs the <html> lang attribute with the current i18n language.
 * Must be rendered inside I18nProvider.
 */
export default function HtmlLangSync() {
  const { language } = useI18n()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  return null
}
