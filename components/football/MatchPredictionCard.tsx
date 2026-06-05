'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

interface ExpertPrediction {
  expertId: string
  winner: 'home' | 'draw' | 'away'
  score: { home: number; away: number }
  halfTime?: { home: number; away: number }
  overUnder: 'over' | 'under'
  confidence: number
  homeWinProb?: number
  drawProb?: number
  awayWinProb?: number
  reasoning: string
}

interface ConsensusPrediction {
  winner: 'home' | 'draw' | 'away'
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  predictedScore: { home: number; away: number }
  predictedHalfTime: { home: number; away: number }
  overUnder: 'over' | 'under'
  overProb: number
  bothTeamsScoreProb: number
  goalDistribution: { goals: number; probability: number }[]
  confidence: number
}

interface MatchPrediction {
  match: {
    id: string
    homeTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    awayTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    date: string
    time: string
    venue: string
    group: string
    status: string
    round: string
  }
  consensus: ConsensusPrediction
  experts: ExpertPrediction[]
}

interface PredictionsResponse {
  success: boolean
  total: number
  predictions: MatchPrediction[]
  generatedAt: string
}

const EXPERT_COLORS: Record<string, { gradient: string; ring: string }> = {
  beckham_chen: { gradient: 'from-blue-500 to-purple-600', ring: 'ring-blue-400' },
  zidane_gao: { gradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-400' },
  batistuta_zhang: { gradient: 'from-red-500 to-rose-600', ring: 'ring-red-400' },
  shearer_zhang: { gradient: 'from-green-500 to-emerald-600', ring: 'ring-green-400' },
  ronaldo_silva: { gradient: 'from-yellow-500 to-amber-600', ring: 'ring-yellow-400' },
}

export default function MatchPredictionCard() {
  const { t, tTeam } = useI18n()
  const { user, isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<PredictionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [userPredictions, setUserPredictions] = useState<Record<string, { winner: string; score: string }>>({})
  const [submittingMatch, setSubmittingMatch] = useState<string | null>(null)
  const [submitResult, setSubmitResult] = useState<Record<string, 'success' | 'error'>>({})

  const buildShareUrl = (pred: MatchPrediction) => {
    const params = new URLSearchParams({
      type: 'match',
      home: pred.match.homeTeam.name,
      away: pred.match.awayTeam.name,
      hWin: String(pred.consensus.homeWinProb),
      draw: String(pred.consensus.drawProb),
      aWin: String(pred.consensus.awayWinProb),
      score: `${pred.consensus.predictedScore.home}-${pred.consensus.predictedScore.away}`,
      confidence: String(pred.consensus.confidence),
      hFlag: pred.match.homeTeam.flag || '⚽',
      aFlag: pred.match.awayTeam.flag || '⚽',
      date: pred.match.date,
      venue: pred.match.venue?.substring(0, 30) || '',
    })
    return `${window.location.origin}/api/og?${params.toString()}`
  }

  const handleShare = async (pred: MatchPrediction) => {
    const shareUrl = buildShareUrl(pred)
    const text = `AI Oracle predicts ${pred.match.homeTeam.name} vs ${pred.match.awayTeam.name}: ${pred.consensus.predictedScore.home}-${pred.consensus.predictedScore.away} (${pred.consensus.confidence}% confidence)`
    const pageUrl = `${window.location.origin}/football`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Netown AI Prediction',
          text,
          url: pageUrl,
        })
      } catch {}
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(`${text}\n${pageUrl}`)
      toast(t('toast.linkCopied'), 'info')
    }
  }

  const handleShareTwitter = (pred: MatchPrediction) => {
    const text = encodeURIComponent(`AI Oracle predicts ${pred.match.homeTeam.name} vs ${pred.match.awayTeam.name}: ${pred.consensus.predictedScore.home}-${pred.consensus.predictedScore.away} (${pred.consensus.confidence}% confidence)`)
    const pageUrl = encodeURIComponent(`${window.location.origin}/football`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`, '_blank')
  }

  const handleUserPredict = async (matchId: string, winner: 'home' | 'draw' | 'away', score: string) => {
    if (!isLoggedIn) return
    setSubmittingMatch(matchId)
    try {
      const res = await fetch('/api/predictions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          type: 'MATCH_RESULT',
          prediction: { winner, score, userId: user?.id }
        })
      })
      const json = await res.json()
      if (json.success) {
        setUserPredictions(prev => ({ ...prev, [matchId]: { winner, score } }))
        setSubmitResult(prev => ({ ...prev, [matchId]: 'success' }))
      } else {
        setSubmitResult(prev => ({ ...prev, [matchId]: 'error' }))
      }
    } catch {
      setSubmitResult(prev => ({ ...prev, [matchId]: 'error' }))
    } finally {
      setSubmittingMatch(null)
      setTimeout(() => setSubmitResult(prev => { const n = { ...prev }; delete n[matchId]; return n }), 3000)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/predictions/auto?limit=8')
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        setError(json.error || 'Failed to load predictions')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getWinnerLabel = (winner: string, homeTeam: string, awayTeam: string) => {
    if (winner === 'home') return homeTeam
    if (winner === 'away') return awayTeam
    return t('pred.draw')
  }

  const getProbColor = (prob: number) => {
    if (prob >= 55) return 'bg-emerald-500'
    if (prob >= 40) return 'bg-cyan-500'
    if (prob >= 30) return 'bg-amber-500'
    return 'bg-slate-500'
  }

  if (loading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            🧠 {t('pred.title')}
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                    <div className="w-24 h-4 bg-slate-700 rounded" />
                  </div>
                  <div className="w-16 h-6 bg-slate-700 rounded" />
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-4 bg-slate-700 rounded" />
                    <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                  </div>
                </div>
                <div className="h-8 bg-slate-700/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-6 shadow-xl">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">⚽</div>
          <p className="text-slate-400 text-sm">{error || t('pred.noData')}</p>
          <button
            onClick={fetchPredictions}
            className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
          >
            {t('pred.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          🧠 {t('pred.title')}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {data.total} {t('pred.matchesAnalyzed')}
          </span>
          <button
            onClick={fetchPredictions}
            className="px-3 py-1.5 text-xs bg-slate-800/50 text-slate-400 hover:text-white rounded-lg transition-colors"
            title={t('pred.refresh')}
          >
            🔄 {t('pred.refresh')}
          </button>
        </div>
      </div>

      {/* Model Badges */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(data as any).models?.map((model: string) => (
          <span key={model} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 font-medium">
            {model}
          </span>
        )) || (
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-medium">
            {(data as any).engine === 'ensemble' ? '🧠 Ensemble (4 models)' : '⚡ ELO Model'}
          </span>
        )}
      </div>

      {/* Prediction Cards */}
      <div className="space-y-4">
        {data.predictions.map((pred) => {
          const isExpanded = expandedMatch === pred.match.id
          const homeShort = pred.match.homeTeam.shortName || pred.match.homeTeam.id
          const awayShort = pred.match.awayTeam.shortName || pred.match.awayTeam.id
          const homeName = tTeam(pred.match.homeTeam.id) || homeShort
          const awayName = tTeam(pred.match.awayTeam.id) || awayShort

          return (
            <div
              key={pred.match.id}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-emerald-500/30"
            >
              {/* Match Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Group & Time badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
                      {pred.match.group}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {pred.match.date} · {pred.match.time}
                    </span>
                  </div>
                  {/* Confidence */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">{t('pred.confidence')}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      pred.consensus.confidence >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                      pred.consensus.confidence >= 50 ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pred.consensus.confidence}%
                    </span>
                  </div>
                </div>

                {/* Teams vs */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{pred.match.homeTeam.flag || '⚽'}</div>
                      <span className="text-white font-semibold text-xs sm:text-sm block">{homeName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <div className="text-slate-500 font-bold text-sm mb-1">VS</div>
                    {/* Consensus Score */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xl sm:text-2xl font-extrabold ${
                        pred.consensus.winner === 'home' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {pred.consensus.predictedScore.home}
                      </span>
                      <span className="text-slate-500 text-lg">:</span>
                      <span className={`text-xl sm:text-2xl font-extrabold ${
                        pred.consensus.winner === 'away' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {pred.consensus.predictedScore.away}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{pred.match.awayTeam.flag || '⚽'}</div>
                      <span className="text-white font-semibold text-xs sm:text-sm block">{awayName}</span>
                    </div>
                  </div>
                </div>

                {/* Win Probability Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={pred.consensus.winner === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {homeName} {pred.consensus.homeWinProb}%
                    </span>
                    <span className={pred.consensus.winner === 'draw' ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {t('pred.draw')} {pred.consensus.drawProb}%
                    </span>
                    <span className={pred.consensus.winner === 'away' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {pred.consensus.awayWinProb}% {awayName}
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-700/50">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${pred.consensus.homeWinProb}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                      style={{ width: `${pred.consensus.drawProb}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${pred.consensus.awayWinProb}%` }}
                    />
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('pred.halfTime')}</div>
                    <div className="text-white font-bold text-sm">
                      {pred.consensus.predictedHalfTime.home} - {pred.consensus.predictedHalfTime.away}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('pred.overUnder')}</div>
                    <div className={`font-bold text-sm ${
                      pred.consensus.overUnder === 'over' ? 'text-emerald-400' : 'text-cyan-400'
                    }`}>
                      {pred.consensus.overUnder === 'over' ? t('pred.over') : t('pred.under')} {pred.consensus.overProb}%
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('pred.bothTeamsScore')}</div>
                    <div className={`font-bold text-sm ${
                      pred.consensus.bothTeamsScoreProb >= 50 ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {pred.consensus.bothTeamsScoreProb}%
                    </div>
                  </div>
                </div>

                {/* Expand button */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setExpandedMatch(isExpanded ? null : pred.match.id)}
                    className="flex-1 py-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1"
                  >
                    {isExpanded ? t('pred.hideExperts') : t('pred.showExperts')}
                    <svg
                      className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Share buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(pred)}
                      className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors"
                      title="Share"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleShareTwitter(pred)}
                      className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-sky-400 hover:bg-slate-700/60 transition-colors"
                      title="Share on X"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Expert Details */}
              {isExpanded && (
                <div className="border-t border-slate-700/50 p-4 bg-slate-900/30">
                  {/* Goal Distribution */}
                  {pred.consensus.goalDistribution && pred.consensus.goalDistribution.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-400 mb-2 font-medium">{t('pred.goalDistribution')}</div>
                      <div className="flex items-end gap-1.5 h-16">
                        {pred.consensus.goalDistribution.slice(0, 7).map((g) => (
                          <div key={g.goals} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-emerald-500/60 to-cyan-500/60 rounded-t transition-all duration-500"
                              style={{ height: `${Math.max(g.probability * 3, 4)}px` }}
                            />
                            <span className="text-[10px] text-slate-500 mt-1">{g.goals}球</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expert Picks */}
                  <div className="text-xs text-slate-400 mb-2 font-medium">{t('pred.expertPicks')}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {pred.experts.map((expert) => {
                      const colors = EXPERT_COLORS[expert.expertId] || EXPERT_COLORS.beckham_chen
                      const expertName = t(`aiExperts.${expert.expertId}.name`) || expert.expertId
                      return (
                        <div
                          key={expert.expertId}
                          className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-2 sm:p-3 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-[9px] font-bold">
                                {expert.expertId.split('_').map(n => n[0].toUpperCase()).join('')}
                              </span>
                            </div>
                            <span className="text-white text-xs font-medium truncate">{expertName}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">{t('pred.pick')}</span>
                              <span className={`font-bold ${
                                expert.winner === 'home' ? 'text-emerald-400' :
                                expert.winner === 'away' ? 'text-cyan-400' : 'text-amber-400'
                              }`}>
                                {expert.winner === 'home' ? homeName : expert.winner === 'away' ? awayName : t('pred.draw')}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">{t('pred.score')}</span>
                              <span className="text-white font-medium">
                                {expert.score.home}-{expert.score.away}
                              </span>
                            </div>
                            {expert.halfTime && (
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">{t('pred.halfTime')}</span>
                                <span className="text-white font-medium">
                                  {expert.halfTime.home}-{expert.halfTime.away}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">{t('pred.confidence')}</span>
                              <span className="text-emerald-400 font-medium">{expert.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* User PK Card */}
                    <UserPKCard
                      matchId={pred.match.id}
                      homeName={homeName}
                      awayName={awayName}
                      experts={pred.experts}
                      isLoggedIn={isLoggedIn}
                      userPick={userPredictions[pred.match.id]}
                      submitting={submittingMatch === pred.match.id}
                      result={submitResult[pred.match.id]}
                      onPredict={(winner, score) => handleUserPredict(pred.match.id, winner, score)}
                      t={t}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between">
        <p className="text-[11px] text-slate-500">
          ⚠️ {t('pred.disclaimer')}
        </p>
        <a
          href="/football/schedule"
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          {t('pred.viewSchedule')} →
        </a>
      </div>
    </div>
  )
}

// Inline User PK Card - sits alongside expert cards
function UserPKCard({
  matchId,
  homeName,
  awayName,
  experts,
  isLoggedIn,
  userPick,
  submitting,
  result,
  onPredict,
  t,
}: {
  matchId: string
  homeName: string
  awayName: string
  experts: ExpertPrediction[]
  isLoggedIn: boolean
  userPick?: { winner: string; score: string }
  submitting: boolean
  result?: 'success' | 'error'
  onPredict: (winner: 'home' | 'draw' | 'away', score: string) => void
  t: (key: string) => string
}) {
  const [pick, setPick] = useState<'home' | 'draw' | 'away' | null>(null)
  const [score, setScore] = useState('')

  // Count how many experts agree with user
  const agreementCount = pick
    ? experts.filter(e => e.winner === pick).length
    : 0

  if (!isLoggedIn) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-3 flex flex-col items-center justify-center text-center">
        <div className="text-2xl mb-1">🔒</div>
        <div className="text-purple-300 text-xs font-medium mb-1">{t('pred.loginToPredict')}</div>
        <a href="#" className="text-[10px] text-purple-400 underline">{t('pred.loginNow')}</a>
      </div>
    )
  }

  if (userPick || result === 'success') {
    const w = userPick?.winner || pick
    const s = userPick?.score || score
    return (
      <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 border border-emerald-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[9px] font-bold">YOU</span>
          </div>
          <span className="text-emerald-400 text-xs font-bold">{t('pred.yourPick')}</span>
          {result === 'success' && <span className="text-[10px] text-emerald-400">✓</span>}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">{t('pred.pick')}</span>
            <span className="text-emerald-400 font-bold">
              {w === 'home' ? homeName : w === 'away' ? awayName : t('pred.draw')}
            </span>
          </div>
          {s && (
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">{t('pred.score')}</span>
              <span className="text-white font-medium">{s}</span>
            </div>
          )}
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">{t('pred.agreeWithYou')}</span>
            <span className="text-cyan-400 font-medium">{agreementCount}/5 {t('pred.experts')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[9px] font-bold">YOU</span>
        </div>
        <span className="text-purple-300 text-xs font-bold">{t('pred.yourPick')}</span>
      </div>
      <div className="space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          {(['home', 'draw', 'away'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setPick(opt)}
              className={`py-1 rounded text-[9px] font-bold transition-colors ${
                pick === opt
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {opt === 'home' ? homeName : opt === 'away' ? awayName : t('pred.draw')}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={score}
          onChange={e => setScore(e.target.value)}
          placeholder="2-1"
          className="w-full px-2 py-1 bg-slate-800/60 border border-slate-700 rounded text-[10px] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
        />
        <button
          onClick={() => pick && onPredict(pick, score)}
          disabled={!pick || submitting}
          className="w-full py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {submitting ? '...' : `PK ⚡`}
        </button>
        {result === 'error' && <div className="text-[9px] text-red-400">Failed</div>}
        {pick && (
          <div className="text-[9px] text-slate-400 text-center">
            {agreementCount}/5 {t('pred.experts')} {t('pred.agreeWithYou')}
          </div>
        )}
      </div>
    </div>
  )
}
