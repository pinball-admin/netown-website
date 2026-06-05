'use client'

import { useI18n } from '@/contexts/I18nContext'
import AccuracyChart from './AccuracyChart'

interface PersonalStats {
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  currentStreak: number
  longestStreak: number
  candyBalance: number
  rank?: number
  accuracyHistory: { date: string; accuracy: number }[]
}

interface PersonalStatsDashboardProps {
  stats: PersonalStats
}

export default function PersonalStatsDashboard({ stats }: PersonalStatsDashboardProps) {
  const { t } = useI18n()

  const statCards = [
    {
      label: t('stats.totalPredictions'),
      value: stats.totalPredictions.toLocaleString(),
      icon: '⚽',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      label: t('stats.accuracy'),
      value: `${stats.accuracy}%`,
      icon: '🎯',
      color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      label: t('stats.currentStreak'),
      value: `${stats.currentStreak}🔥`,
      icon: '🔥',
      color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
      textColor: 'text-orange-400',
    },
    {
      label: t('stats.candyBalance'),
      value: stats.candyBalance.toLocaleString(),
      icon: '🍬',
      color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
      textColor: 'text-amber-400',
    },
  ]

  return (
    <div className="space-y-4">
      {/* 2x2 Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border rounded-xl p-3 sm:p-4`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{card.icon}</span>
              <span className="text-[10px] sm:text-xs text-slate-400">{card.label}</span>
            </div>
            <div className={`text-lg sm:text-xl font-bold ${card.textColor}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Accuracy Trend Chart */}
      {stats.accuracyHistory && stats.accuracyHistory.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>📈</span>
            {t('stats.accuracyTrend')}
          </h4>
          <AccuracyChart data={stats.accuracyHistory} height={120} />
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-800/40 rounded-lg p-3">
          <span className="text-slate-500 text-xs">{t('stats.longestStreak')}</span>
          <div className="text-white font-semibold mt-1">{stats.longestStreak} ⚡</div>
        </div>
        <div className="bg-slate-800/40 rounded-lg p-3">
          <span className="text-slate-500 text-xs">{t('stats.correctPredictions')}</span>
          <div className="text-white font-semibold mt-1">{stats.correctPredictions}</div>
        </div>
        {stats.rank && (
          <div className="bg-slate-800/40 rounded-lg p-3 col-span-2">
            <span className="text-slate-500 text-xs">{t('stats.globalRank')}</span>
            <div className="text-white font-semibold mt-1">
              #{stats.rank} <span className="text-amber-400">🏆</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
