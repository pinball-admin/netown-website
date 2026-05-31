'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

export default function TeamNav() {
  const { t } = useI18n()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <Link href="/football" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">{t('common.backToDashboard')}</span>
        </Link>
      </div>
    </nav>
  )
}
