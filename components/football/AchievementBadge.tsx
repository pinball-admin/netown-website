'use client'

import { useI18n } from '@/contexts/I18nContext'

export type AchievementType = 'streak_3' | 'streak_7' | 'accuracy_80' | 'predictions_100' | 'champion'

interface AchievementBadgeProps {
  type: AchievementType
  size?: 'sm' | 'md' | 'lg'
}

const ACHIEVEMENT_CONFIG: Record<AchievementType, { emoji: string; label: string; color: string; bg: string }> = {
  streak_3: { emoji: '🔥', label: '3-Day Streak', color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  streak_7: { emoji: '⚡', label: '7-Day Streak', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  accuracy_80: { emoji: '🎯', label: '80% Accuracy', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  predictions_100: { emoji: '💯', label: '100 Predictions', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
  champion: { emoji: '👑', label: 'Champion', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-lg',
}

export default function AchievementBadge({ type, size = 'md' }: AchievementBadgeProps) {
  const { t } = useI18n()
  const config = ACHIEVEMENT_CONFIG[type]

  return (
    <div
      className={`${SIZE_CLASSES[size]} ${config.bg} border rounded-full flex items-center justify-center relative group cursor-default`}
      title={config.label}
    >
      <span>{config.emoji}</span>
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div className={`${config.color} text-xs font-medium bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700`}>
          {config.label}
        </div>
      </div>
    </div>
  )
}
