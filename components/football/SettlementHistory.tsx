'use client'

import { useI18n } from '@/contexts/I18nContext'
import { useUserPredictions } from '@/libs/data/swr-hooks'
import { SkeletonCard } from '@/components/ui/Skeleton'

export default function SettlementHistory() {
  const { t } = useI18n()
  const { data, isLoading } = useUserPredictions()

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">📋 {t('settlement.recentSettlements') || 'Recent Settlements'}</h3>
        <SkeletonCard />
      </div>
    )
  }

  const predictions = data?.success ? (data.predictions || []) : []
  // Filter to only settled predictions, sorted newest first
  const settled = predictions
    .filter((p: any) => p.isCorrect !== null && p.settledAt)
    .sort((a: any, b: any) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime())
    .slice(0, 10)

  if (settled.length === 0) {
    return null
  }

  const handleShare = async (pred: any) => {
    const matchName = pred.matchId?.replace(/-/g, ' ') || `Match #${pred.matchId}`
    const emoji = pred.isCorrect ? '✅' : '❌'
    const points = pred.isCorrect && pred.pointsAwarded > 0 ? ` +${pred.pointsAwarded}🍬` : ''
    const predictionText = `${pred.predictionType}: ${pred.prediction}`
    const settledDate = pred.settledAt ? new Date(pred.settledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

    const text = [
      `${emoji} My #WorldCup2026 prediction result!`,
      `${matchName} | ${predictionText}${points}`,
      `Settled: ${settledDate}`,
      '',
      `Can you beat me? Make predictions at Netown!`,
      '#Netown #AIPredictions',
    ].join('\n')
    const pageUrl = `${window.location.origin}/football`

    // Build OG image URL for the prediction
    const ogParams = new URLSearchParams({
      type: 'prediction',
      home: matchName.substring(0, 20),
      away: '',
      prediction: pred.prediction || '?',
      typeLabel: pred.predictionType || 'PREDICTION',
      status: pred.isCorrect === true ? 'correct' : pred.isCorrect === false ? 'incorrect' : 'pending',
      points: String(pred.pointsAwarded || 0),
      username: 'My Prediction',
    })
    const ogUrl = `${window.location.origin}/api/og?${ogParams.toString()}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Netown Prediction Result', text, url: ogUrl })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${pageUrl}`)
      } catch {}
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span>📋</span>
        {t('settlement.recentSettlements') || 'Recent Settlements'}
      </h3>
      <div className="space-y-2">
        {settled.map((pred: any, i: number) => (
          <div
            key={pred.id || i}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              pred.isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-lg flex-shrink-0">
                {pred.isCorrect ? '✅' : '❌'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-200 truncate">
                  {pred.matchId?.replace(/-/g, ' ') || `Match #${pred.matchId}`}
                </div>
                <div className="text-xs text-slate-500">
                  {pred.predictionType} · {pred.prediction}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {pred.isCorrect && pred.pointsAwarded > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-medium">
                  +{pred.pointsAwarded} 🍬
                </span>
              )}
              <button
                onClick={() => handleShare(pred)}
                className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors"
                title="Share result"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
