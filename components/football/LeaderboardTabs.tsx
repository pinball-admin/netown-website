'use client'

import { useI18n } from '@/contexts/I18nContext'

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime'

interface LeaderboardTabsProps {
  active: LeaderboardPeriod
  onChange: (period: LeaderboardPeriod) => void
}

const TABS: { value: LeaderboardPeriod; emoji: string; labelKey: string }[] = [
  { value: 'weekly', emoji: '🔥', labelKey: 'leaderboard.weekly' },
  { value: 'monthly', emoji: '📅', labelKey: 'leaderboard.monthly' },
  { value: 'alltime', emoji: '🏆', labelKey: 'leaderboard.allTime' },
]

export default function LeaderboardTabs({ active, onChange }: LeaderboardTabsProps) {
  const { t } = useI18n()

  return (
    <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
            active === tab.value
              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span>{tab.emoji}</span>
          <span>{t(tab.labelKey)}</span>
        </button>
      ))}
    </div>
  )
}
