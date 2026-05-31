'use client'

import { useI18n } from '@/contexts/I18nContext'

export default function GamersCorner() {
  const { t } = useI18n()

  return (
    <div className="bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-900/80 border border-purple-500/20 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🎮</span>
        <div>
          <h3 className="text-white font-bold text-lg">{t('gamersCorner.title')}</h3>
          <p className="text-purple-400 text-xs font-medium">{t('gamersCorner.playLikePro')}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EA</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{t('gamersCorner.eaSportsFC')}</p>
            <p className="text-slate-400 text-xs">{t('gamersCorner.specialEdition')}</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          {t('gamersCorner.description')}
        </p>
      </div>

      <a
        href="https://www.ea.com/games/fc/fc-24/buy?cid=netown&pid=netown&aid=netown"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold rounded-lg text-center transition-all duration-200 shadow-lg shadow-purple-500/20"
      >
        {t('gamersCorner.preOrder')}
      </a>

      <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500">
        <span className="text-center">{t('gamersCorner.alsoAvailableOn')}</span>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-2 py-1 bg-slate-800/60 text-slate-300 rounded">{t('gaming.playStation')}</span>
          <span className="px-2 py-1 bg-slate-800/60 text-slate-300 rounded">{t('gaming.xbox')}</span>
          <span className="px-2 py-1 bg-slate-800/60 text-slate-300 rounded">{t('gaming.steam')}</span>
        </div>
      </div>
    </div>
  )
}
