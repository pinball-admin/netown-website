'use client'

import { useI18n } from '@/contexts/I18nContext'

export default function AmazonBanner() {
  const { t } = useI18n()

  return (
    <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-xl p-4 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">▼</span>
          </div>
          <div>
            <p className="text-orange-400 text-xs font-medium uppercase tracking-wider">
              {t('amazonSection.title')}
            </p>
            <p className="text-white font-semibold">{t('amazonSection.worldCupGear')}</p>
          </div>
        </div>
        <a
          href="https://www.amazon.com/s?k=world+cup+2026+merchandise&tag=netown-20"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/20"
        >
          {t('amazonSection.shopNow')}
        </a>
      </div>
    </div>
  )
}
