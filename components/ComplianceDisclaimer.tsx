'use client'

import { useI18n } from '@/contexts/I18nContext'

export default function ComplianceDisclaimer() {
  const { t } = useI18n()
  
  return (
    <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border-t border-slate-800 py-4 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-sm text-slate-400">
        <span className="text-yellow-400 text-base">⚠️</span>
        <span className="text-center">
          {t('compliance.disclaimer') || 'Disclaimer: All predictions are free of charge and intended for statistical research only. Not investment or betting advice.'}
        </span>
      </div>
    </div>
  )
}