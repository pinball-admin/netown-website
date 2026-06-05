'use client'

import { useI18n } from '@/contexts/I18nContext'
import { ExpertId, EXPERT_IDS } from '@/libs/types'

interface ExpertData {
  id: ExpertId
  gradient: string
  accentColor: string
  imageUrl: string
  specialty: string
}

const EXPERT_CONFIG: Record<ExpertId, ExpertData> = {
  beckham_chen: {
    id: 'beckham_chen',
    gradient: 'from-blue-500 to-purple-600',
    accentColor: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1489944440615?w=200',
    specialty: 'Bayesian Logic',
  },
  zidane_gao: {
    id: 'zidane_gao',
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200',
    specialty: 'Neural Network',
  },
  batistuta_zhang: {
    id: 'batistuta_zhang',
    gradient: 'from-red-500 to-rose-600',
    accentColor: 'red',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629?w=200',
    specialty: 'xG Analysis',
  },
  shearer_zhang: {
    id: 'shearer_zhang',
    gradient: 'from-green-500 to-emerald-600',
    accentColor: 'green',
    imageUrl: 'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=200',
    specialty: 'Physical Battle',
  },
  ronaldo_silva: {
    id: 'ronaldo_silva',
    gradient: 'from-yellow-500 to-amber-600',
    accentColor: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200',
    specialty: 'Samba Style',
  },
}

interface ExpertStats {
  expertId: string
  totalMatches: number
  correctResults: number
  accuracy: number
  streak: number
  rank: number
  isChampion: boolean
  medals: string[]
}

interface AIExpertsSectionProps {
  expertStats?: Record<ExpertId, ExpertStats>
  championExpert?: ExpertId | null
  demotedExperts?: Record<ExpertId, boolean>
  expertRanking?: ExpertId[]
  onShareExpert?: (expertId: ExpertId) => void
}

function ExpertCard({
  expert,
  stats,
  isChampion,
  isDemoted,
  rank,
  onShare,
}: {
  expert: ExpertData
  stats: ExpertStats | null
  isChampion: boolean
  isDemoted: boolean
  rank: number
  onShare?: () => void
}) {
  const { t } = useI18n()
  const name = t(`aiExperts.${expert.id}.name`) || expert.id
  const preferences = t(`aiExperts.${expert.id}.preferences`) || ''
  const traits = t(`aiExperts.${expert.id}.traits`) || ''

  const accuracy = stats?.accuracy || 0
  const streak = stats?.streak || 0
  const medals = stats?.medals || []

  return (
    <div
      className={`
        group relative transition-all duration-500
        ${isChampion ? 'scale-105 z-10' : ''}
        ${isDemoted ? 'opacity-50 scale-95' : ''}
      `}
    >
      {isChampion && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
            <span className="text-lg">👑</span>
            <span>神算子</span>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-br ${expert.gradient} opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-opacity duration-500 ${isChampion ? 'animate-pulse' : ''}`} />

      <div className={`
        relative bg-[#0a0a0a] border rounded-2xl p-6 transition-all duration-300
        ${isChampion
          ? 'border-amber-500/50 shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30'
          : 'border-slate-800/50 hover:border-slate-700/80'
        }
        ${isDemoted ? 'grayscale' : ''}
        hover:-translate-y-2
      `}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-lg ${isChampion ? 'ring-2 ring-amber-400' : ''}`}>
            <img src={expert.imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs text-slate-500">{t('ai.rank').replace('#', '')}#{rank}</div>
            {streak >= 3 && (
              <div className="text-xs text-orange-400 font-medium flex items-center gap-1">
                🔥 {streak}连胜
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-2">
          {name}
          {isChampion && <span className="ml-2">👑</span>}
        </h3>

        <div className={`text-${expert.accentColor}-400 text-xs font-medium text-center mb-4 uppercase tracking-wider`}>
          {expert.specialty}
        </div>

        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{t('ai.methodLabel')}</span>
              <span className="text-xs text-emerald-400 font-medium">{accuracy}% {t('ai.accuracyLabel')}</span>
            </div>
            <div className="text-sm text-slate-300 truncate">{preferences}</div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">{t('ai.styleLabel')}</div>
            <div className="text-sm text-slate-300">{traits}</div>
          </div>
        </div>

        {medals.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {medals.map((medal, i) => (
              <span key={i} className="text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 px-2 py-1 rounded-full">
                {medal.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        <div className={`mt-4 h-1 bg-gradient-to-r ${expert.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />

        {isChampion && onShare && (
          <button
            onClick={onShare}
            className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>📤</span>
            <span>{t('ai.shareExpert')}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function AIExpertsSection({
  expertStats,
  championExpert,
  demotedExperts,
  expertRanking,
  onShareExpert,
}: AIExpertsSectionProps) {
  const { t } = useI18n()

  const stats = expertStats || {} as Record<ExpertId, ExpertStats>
  const champion = championExpert || null
  const demoted = demotedExperts || {} as Record<ExpertId, boolean>
  const ranking = expertRanking || [...EXPERT_IDS]

  const sortedExperts = ranking.map(id => EXPERT_CONFIG[id])

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t('aiPersonas.title')}
            </h2>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500" />
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('aiPersonas.description')}
          </p>
          {champion && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
              <span className="text-2xl">👑</span>
              <span className="text-amber-400 font-semibold">{t('ai.currentChampion')} {t(`aiExperts.${champion}.name`)}</span>
              <span className="text-slate-400 text-sm">({stats[champion]?.accuracy || 0}% {t('ai.accuracyRate')})</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {sortedExperts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              stats={stats[expert.id] || null}
              isChampion={champion === expert.id}
              isDemoted={demoted[expert.id] || false}
              rank={ranking.indexOf(expert.id) + 1}
              onShare={champion === expert.id ? () => onShareExpert?.(expert.id) : undefined}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/football"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 font-semibold hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <span>{t('aiPersonas.cta') || 'Try AI Predictions'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

export { ExpertCard }
export type { ExpertStats, AIExpertsSectionProps }