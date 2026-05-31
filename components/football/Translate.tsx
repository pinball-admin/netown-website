'use client'

import { useI18n } from '@/contexts/I18nContext'

interface TranslateProps {
  text: string
  className?: string
}

export default function Translate({ text, className }: TranslateProps) {
  const { t } = useI18n()
  return <span className={className}>{t(text)}</span>
}
