'use client'

import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface GlobalOracleProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalOracle({ isOpen, onClose }: GlobalOracleProps) {
  const { t, tTeam } = useI18n()
  const [isGenerating, setIsGenerating] = useState(false)

  const aiExperts = ['zidane_gao', 'beckham_chen', 'batistuta_zhang', 'ronaldo_silva', 'shearer_zhang']

  const expertGradients: Record<string, string> = {
    zidane_gao: 'from-amber-500 to-orange-600',
    beckham_chen: 'from-blue-500 to-purple-600',
    batistuta_zhang: 'from-red-500 to-rose-600',
    ronaldo_silva: 'from-yellow-500 to-amber-600',
    shearer_zhang: 'from-green-500 to-emerald-600',
  }

  const expertInitials: Record<string, string> = {
    zidane_gao: 'ZG',
    beckham_chen: 'BC',
    batistuta_zhang: 'BZ',
    ronaldo_silva: 'RS',
    shearer_zhang: 'SZ',
  }

  const expertConfidences: Record<string, number> = {
    zidane_gao: 85,
    beckham_chen: 78,
    batistuta_zhang: 72,
    ronaldo_silva: 68,
    shearer_zhang: 65,
  }

  const expertPredictionKeys: Record<string, string> = {
    zidane_gao: 'globalOracle.predictionZidane',
    beckham_chen: 'globalOracle.predictionBeckham',
    batistuta_zhang: 'globalOracle.predictionBatistuta',
    ronaldo_silva: 'globalOracle.predictionRonaldo',
    shearer_zhang: 'globalOracle.predictionShearer',
  }

  const top4Teams = ['ARG', 'FRA', 'BRA', 'ENG']
  const top4Flags: Record<string, string> = {
    ARG: '🇦🇷',
    FRA: '🇫🇷',
    BRA: '🇧🇷',
    ENG: '🏴',
  }
  const top4Votes: Record<string, number> = {
    ARG: 4,
    FRA: 3,
    BRA: 3,
    ENG: 2,
  }

  const handleSharePoster = async () => {
    const captureArea = document.getElementById('oracle-capture-area')
    if (!captureArea) return

    setIsGenerating(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(captureArea, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#030712',
      })
      const link = document.createElement('a')
      link.download = 'netown-2026-oracle-prediction.png'
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate poster:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="oracle-capture-area" className="relative">
          <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <span className="text-2xl">🔮</span>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    {t('home.globalOracle')}
                  </h2>
                  <p className="text-slate-400 text-sm">{t('aiPersonas.title')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-amber-400 font-semibold text-sm mb-1">💡 {t('globalOracle.foundersNote')}</p>
              <p className="text-slate-300 text-sm italic">
                &quot;{t('globalOracle.foundersMessage')}&quot;
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                  🏆 {t('globalOracle.champion')}
                </span>
                <span className="text-slate-400 text-sm">{t('globalOracle.mostConfident')}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{top4Flags.ARG}</div>
                <div>
                  <p className="text-white font-bold text-xl">{tTeam('ARG')}</p>
                  <p className="text-emerald-400 text-sm">{t('globalOracle.defendCrown')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <h3 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                {t('aiPersonas.title')}
              </h3>
              {aiExperts.map((expert) => (
                <div
                  key={expert}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${expertGradients[expert]} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{expertInitials[expert]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-sm">{t(`aiExperts.${expert}.name`)}</span>
                        <span className="text-emerald-400 text-xs font-medium">{expertConfidences[expert]}% {t('globalOracle.trust')}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{t(expertPredictionKeys[expert])}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">
                  🎯 {t('globalOracle.top4')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {top4Teams.map((team) => (
                  <div key={team} className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{top4Flags[team]}</div>
                    <p className="text-white text-sm font-medium">{tTeam(team)}</p>
                    <p className="text-slate-500 text-xs">{top4Votes[team]} {t('globalOracle.votes')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                  ⚠️ {t('globalOracle.firstEliminated')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🇨🇦</div>
                <div>
                  <p className="text-white font-bold">{tTeam('CAN')}</p>
                  <p className="text-slate-400 text-sm">{t('globalOracle.reasonCanada')}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30 mb-4">
              <p className="text-slate-500 text-xs text-center">
                * {t('globalOracle.disclaimer')}
              </p>
            </div>

            <div className="flex justify-end mb-4">
              <span className="text-slate-600 text-xs font-medium">football.netown.cn</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 bg-gradient-to-t from-slate-900 to-transparent pt-4">
          <button
            onClick={handleSharePoster}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{t('globalOracle.generating')}</span>
              </>
            ) : (
              <>
                <span>🔮</span>
                <span>{t('globalOracle.shareOracle')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}