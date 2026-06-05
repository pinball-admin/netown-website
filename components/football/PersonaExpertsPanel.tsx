'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { usePrediction, useExpert } from '@/contexts/PredictionContext'
import { ExpertId } from '@/libs/types'
import AIExpertCard from '@/components/football/AIExpertCard'
import { SkeletonExpertCard } from '@/components/ui/Skeleton'

const PERSONA_IDS: ExpertId[] = [
  'beckham_chen',
  'zidane_gao',
  'batistuta_zhang',
  'shearer_zhang',
  'ronaldo_silva',
]

const PERSONA_META: Record<
  ExpertId,
  { gradient: string; accentColor: string; imageUrl: string }
> = {
  beckham_chen: {
    gradient: 'from-blue-500 to-purple-600',
    accentColor: 'blue',
    imageUrl: '',
  },
  zidane_gao: {
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    imageUrl: '',
  },
  batistuta_zhang: {
    gradient: 'from-red-500 to-rose-600',
    accentColor: 'red',
    imageUrl: '',
  },
  shearer_zhang: {
    gradient: 'from-green-500 to-emerald-600',
    accentColor: 'green',
    imageUrl: '',
  },
  ronaldo_silva: {
    gradient: 'from-yellow-500 to-amber-600',
    accentColor: 'yellow',
    imageUrl: '',
  },
}

export default function PersonaExpertsPanel() {
  const { t } = useI18n()
  const { isLoading } = usePrediction()

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          🏆 {t('ui.aiPredictionMasters')} ({PERSONA_IDS.length} Masters)
        </h2>
        <Link
          href="/football/forum"
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {t('ui.joinDebate')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <SkeletonExpertCard />
            <SkeletonExpertCard />
            <SkeletonExpertCard />
            <SkeletonExpertCard />
            <SkeletonExpertCard />
          </>
        ) : (
          PERSONA_IDS.map((id) => {
          const meta = PERSONA_META[id]
          const prefs = t(`aiExperts.${id}.preferences`) || ''
          const traits = t(`aiExperts.${id}.traits`) || ''
          return (
            <LiveExpertCard
              key={id}
              expertId={id}
              id={`master-${id}`}
              name={t(`aiExperts.${id}.name`) || id}
              specialty={prefs.split(',')[0]?.trim() || 'Football AI'}
              gradient={meta.gradient}
              accentColor={meta.accentColor}
              imageUrl={meta.imageUrl}
              preferences={prefs ? prefs.split(',').map((s) => s.trim()).slice(0, 3) : []}
              traits={traits ? traits.split(',').map((s) => s.trim()).slice(0, 2) : []}
            />
          )
          })
        )}
      </div>
    </div>
  )
}

// Inner component that uses useExpert hook to get live stats
function LiveExpertCard({
  expertId,
  ...props
}: {
  expertId: ExpertId
  id: string
  name: string
  specialty: string
  gradient: string
  accentColor: string
  imageUrl: string
  preferences: string[]
  traits: string[]
}) {
  const { stats, isChampion } = useExpert(expertId)
  
  const accuracy = stats?.accuracy || 72
  const streak = stats?.streak || 0
  
  return (
    <AIExpertCard
      {...props}
      accuracy={accuracy}
      streak={streak}
      isChampion={isChampion}
    />
  )
}
