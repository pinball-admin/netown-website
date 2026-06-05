'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import LeaderboardTabs, { LeaderboardPeriod } from './LeaderboardTabs'
import AchievementBadge, { AchievementType } from './AchievementBadge'

interface LeaderboardEntry {
  userId: string
  name: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  ranking: number
  achievements?: string[]
}

const avatarEmojis = ['🏆', '🥇', '🥈', '🥉', '⚡', '🔥', '🌟', '💫', '🎯', '💪']

export default function LeaderboardWidget() {
  const { t } = useI18n()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<LeaderboardPeriod>('alltime')

  useEffect(() => {
    fetch(`/api/leaderboard?period=${period}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard) {
          setEntries(data.leaderboard.slice(0, 10))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-700" />
            <div className="flex-1">
              <div className="h-3 bg-slate-700 rounded w-24 mb-1" />
              <div className="h-2 bg-slate-700 rounded w-16" />
            </div>
            <div className="h-4 bg-slate-700 rounded w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        {t('candyPoints.predictionMasters') || 'No predictors yet'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <LeaderboardTabs active={period} onChange={setPeriod} />
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry, index) => (
        <div
          key={entry.userId}
          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-slate-700/40 ${
            index < 3 ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-800/30'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Rank */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${index === 0 ? 'bg-amber-500/30 text-amber-400' : ''}
              ${index === 1 ? 'bg-slate-400/30 text-slate-300' : ''}
              ${index === 2 ? 'bg-orange-600/30 text-orange-400' : ''}
              ${index >= 3 ? 'bg-slate-700/50 text-slate-500' : ''}
            `}>
              {entry.ranking <= 3 ? entry.ranking : entry.ranking}
            </div>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm flex-shrink-0">
              {avatarEmojis[index] || '⚽'}
            </div>

            {/* Name & Stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-sm font-medium truncate">
                  {entry.name || 'Anonymous'}
                </span>
                {entry.achievements && entry.achievements.length > 0 && (
                  <div className="flex gap-0.5">
                    {entry.achievements.map((a) => (
                      <AchievementBadge key={a} type={a as AchievementType} size="sm" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>{entry.totalPredictions} {t('ui.predictions') || 'pred'}</span>
                <span>•</span>
                <span className={entry.accuracy >= 50 ? 'text-emerald-400' : 'text-orange-400'}>
                  {entry.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Candy Points */}
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-amber-400 font-bold text-sm">{entry.candyBalance}</div>
            <div className="text-[10px] text-slate-500">🍬</div>
          </div>
        </div>
      ))}
        </div>
      ) : null}
    </div>
  )
}
