'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface PredictionModalProps {
  isOpen: boolean
  onClose: () => void
  match: {
    id: number
    team1: string
    team2: string
    date: string
    time: string
  } | null
  persona: {
    id: string
    name: string
    alias: string
    initials: string
    gradient: string
  } | null
  prediction: {
    winner: string
    score: string
    confidence: number
    analysis: string
  } | null
}

export default function PredictionModal({ isOpen, onClose, match, persona, prediction }: PredictionModalProps) {
  const { t, tTeam } = useI18n()
  const [isGenerating, setIsGenerating] = useState(false)

  const getProbabilities = useCallback(() => {
    if (!match || !prediction) return { home: 33, draw: 33, away: 33 }

    const seed = match.id + match.team1.length
    const baseHome = 30 + (seed % 25)
    const baseDraw = 20 + ((seed * 7) % 20)
    const baseAway = 100 - baseHome - baseDraw

    let homeProb = baseHome
    let awayProb = baseAway

    if (prediction.winner === match.team1) {
      homeProb += 20
    } else if (prediction.winner === match.team2) {
      awayProb += 20
    } else {
      return { home: baseHome, draw: baseDraw + 20, away: baseAway }
    }

    const total = homeProb + awayProb
    return {
      home: Math.round((homeProb / total) * 100),
      draw: baseDraw,
      away: Math.round((awayProb / total) * 100)
    }
  }, [match, prediction])

  const probabilities = getProbabilities()

  const handleSharePoster = async () => {
    const captureArea = document.getElementById('poster-capture-area')
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
      link.download = 'netown-worldcup-prediction.png'
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate poster:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen || !match || !persona || !prediction) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-emerald-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="poster-capture-area" className="relative">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />

          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${persona.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-xl">{persona.initials}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{persona.alias}</h3>
                <p className="text-emerald-400 text-sm">{t('prediction.analyzing')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">{match.date} {match.time}</span>
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
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-2">
                  <span className="text-slate-300 font-bold">{tTeam(match.team1).substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="text-white font-semibold">{tTeam(match.team1)}</span>
              </div>

              <div className="px-6">
                <div className="text-slate-500 font-bold text-2xl">{t('schedule.vs')}</div>
              </div>

              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-2">
                  <span className="text-slate-300 font-bold">{tTeam(match.team2).substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="text-white font-semibold">{tTeam(match.team2)}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">{t('prediction.optionA')}</span>
                <span className="text-slate-300 text-sm font-medium">{t('prediction.bigDataAnalytics')}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{tTeam(match.team1)}</span>
                  <span className="text-white font-semibold">{probabilities.home}%</span>
                </div>
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                    style={{ width: `${probabilities.home}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-500"
                    style={{ width: `${probabilities.draw}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${probabilities.away}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t('prediction.win')}</span>
                  <span>{t('prediction.draw')}</span>
                  <span>{t('prediction.loss')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{tTeam(match.team2)}</span>
                  <span className="text-white font-semibold">{probabilities.away}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">{t('prediction.optionB')}</span>
                <span className="text-slate-300 text-sm font-medium">{t('prediction.aiOracle')} · {t('prediction.crazyScore')}</span>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <span className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                  {prediction.score.split('-')[0].trim()}
                </span>
                <span className="text-4xl font-bold text-slate-500">:</span>
                <span className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                  {prediction.score.split('-')[1].trim()}
                </span>
              </div>

              <div className="text-center mt-2">
                <span className="text-emerald-400 font-semibold text-lg">{tTeam(prediction.winner)}</span>
                <span className="text-slate-400 text-sm ml-2">{t('prediction.predictedToWin')}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
              <p className="text-slate-400 text-sm italic">&ldquo;{prediction.analysis}&rdquo;</p>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
              <p className="text-slate-500 text-xs text-center">
                * {t('prediction.disclaimer')}
              </p>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex justify-end">
              <span className="text-slate-600 text-xs font-medium">football.netown.cn</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 bg-gradient-to-t from-slate-900 to-transparent pt-4">
          <button
            onClick={handleSharePoster}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:from-emerald-400 hover:via-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{t('prediction.generating')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{t('prediction.sharePoster')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}