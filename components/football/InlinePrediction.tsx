'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

interface InlinePredictionProps {
  matchId: string
  homeTeam: string
  awayTeam: string
}

type PredictionType = 'home_win' | 'draw' | 'away_win'

export default function InlinePrediction({ matchId, homeTeam, awayTeam }: InlinePredictionProps) {
  const { t } = useI18n()
  const { user, isLoggedIn } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<PredictionType | null>(null)
  const [existingPrediction, setExistingPrediction] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Check for existing prediction
  useEffect(() => {
    if (!isLoggedIn) return
    const stored = localStorage.getItem(`pred_${matchId}`)
    if (stored) {
      setExistingPrediction(stored)
      setSelected(stored as PredictionType)
    }
  }, [matchId, isLoggedIn])

  const handlePredict = async (pick: PredictionType) => {
    if (!isLoggedIn) return
    setSelected(pick)
    setSubmitting(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/predictions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          type: 'MATCH_RESULT',
          prediction: pick,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setExistingPrediction(pick)
        localStorage.setItem(`pred_${matchId}`, pick)
        setMessage('✅')
      } else {
        setMessage(data.message || '❌')
      }
    } catch {
      setMessage('❌')
    }
    setSubmitting(false)
    setTimeout(() => setMessage(null), 2000)
  }

  const getPickStyle = (pick: PredictionType) => {
    const isSelected = selected === pick
    const isSubmitted = existingPrediction === pick
    return `
      px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
      ${isSubmitted
        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/10'
        : isSelected && submitting
        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-600/50 hover:text-white'
      }
    `
  }

  if (!isLoggedIn) {
    return (
      <span className="text-[10px] text-slate-500 italic">
        {t('pred.loginToPredict')}
      </span>
    )
  }

  if (existingPrediction) {
    const labels: Record<string, string> = {
      home_win: homeTeam,
      draw: t('pred.draw'),
      away_win: awayTeam,
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/80">
        <span>✓</span>
        <span>{labels[existingPrediction] || existingPrediction}</span>
      </span>
    )
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all"
        >
          {t('pred.pick')}
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <button onClick={() => handlePredict('home_win')} className={getPickStyle('home_win')}>
            {homeTeam}
          </button>
          <button onClick={() => handlePredict('draw')} className={getPickStyle('draw')}>
            {t('pred.draw')}
          </button>
          <button onClick={() => handlePredict('away_win')} className={getPickStyle('away_win')}>
            {awayTeam}
          </button>
          <button
            onClick={() => { setIsOpen(false); setSelected(null) }}
            className="px-1.5 py-1.5 text-xs text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>
          {message && <span className="text-xs">{message}</span>}
        </div>
      )}
    </div>
  )
}
