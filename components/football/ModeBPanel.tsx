'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface SimulationResult {
  homeScore: number
  awayScore: number
  count: number
  probability: number
}

interface CrazyScores {
  scores: SimulationResult[]
  totalProbability: number
  avgTotalGoals: number
  mostLikelyCrazy: SimulationResult | null
}

interface ModeBData {
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  avgHomeGoals: number
  avgAwayGoals: number
  avgTotalGoals: number
  totalSimulations: number
  topScores: SimulationResult[]
  crazyScores: CrazyScores
  goalDistribution: { goals: number; probability: number }[]
  blowoutProbability: number
  oneGoalGameProbability: number
  cleanSheetProbability: { home: number; away: number }
  expectedHomeGoals: number
  expectedAwayGoals: number
}

interface ModeBPrediction {
  match: {
    id: string
    homeTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    awayTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    date: string
    time: string
    group: string
  }
  simulation: ModeBData
  crazyScoreHighlight: { score: string; probability: number; totalGoals: number } | null
  mostLikely: { score: string; probability: number } | null
}

interface ApiResponse {
  success: boolean
  predictions: ModeBPrediction[]
  generatedAt: string
}

export default function ModeBPanel() {
  const { t, tTeam } = useI18n()
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  useEffect(() => {
    fetchModeB()
  }, [])

  const fetchModeB = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/predictions/mode-b?limit=4')
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        setError(json.error || 'Failed to load simulations')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getOutcomeColor = (prob: number) => {
    if (prob >= 55) return 'text-emerald-400'
    if (prob >= 35) return 'text-cyan-400'
    return 'text-slate-400'
  }

  if (loading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎲 {t('pred.modeB')}
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                    <div className="w-24 h-4 bg-slate-700 rounded" />
                  </div>
                  <div className="w-20 h-6 bg-slate-700 rounded" />
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-4 bg-slate-700 rounded" />
                    <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-slate-700/50 rounded-lg" />
                  <div className="h-16 bg-slate-700/50 rounded-lg" />
                  <div className="h-16 bg-slate-700/50 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎲</div>
          <p className="text-slate-400 text-sm">{error || t('pred.noData')}</p>
          <button
            onClick={fetchModeB}
            className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
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
        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          🎲 {t('pred.modeB')}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
            {t('pred.totalSimulations')}
          </span>
          <button
            onClick={fetchModeB}
            className="px-3 py-1.5 text-xs bg-slate-800/50 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            🔄 {t('pred.refresh')}
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        {t('pred.modeBDesc')}
      </p>

      {/* Simulation Cards */}
      <div className="space-y-4">
        {data.predictions.map((pred) => {
          const isExpanded = expandedMatch === pred.match.id
          const sim = pred.simulation
          const homeName = tTeam(pred.match.homeTeam.id) || pred.match.homeTeam.shortName
          const awayName = tTeam(pred.match.awayTeam.id) || pred.match.awayTeam.shortName

          return (
            <div
              key={pred.match.id}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/30"
            >
              {/* Match Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
                      {pred.match.group}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {pred.match.date} · {pred.match.time}
                    </span>
                  </div>
                  {/* Crazy Score Highlight */}
                  {pred.crazyScoreHighlight && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-pink-400">{t('pred.crazyScore')}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border border-purple-500/30">
                        {pred.crazyScoreHighlight.score} ⚡
                      </span>
                    </div>
                  )}
                </div>

                {/* Teams vs */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{pred.match.homeTeam.flag || '⚽'}</div>
                      <span className="text-white font-semibold text-xs sm:text-sm block">{homeName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <div className="text-slate-500 font-bold text-sm mb-1">VS</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl sm:text-2xl font-extrabold ${getOutcomeColor(sim.homeWinProb)}`}>
                        {pred.mostLikely?.score.split('-')[0] || '?'}
                      </span>
                      <span className="text-slate-500 text-lg">:</span>
                      <span className={`text-xl sm:text-2xl font-extrabold ${getOutcomeColor(sim.awayWinProb)}`}>
                        {pred.mostLikely?.score.split('-')[1] || '?'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {t('pred.mostLikelyScore')} {pred.mostLikely?.probability.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{pred.match.awayTeam.flag || '⚽'}</div>
                      <span className="text-white font-semibold text-xs sm:text-sm block">{awayName}</span>
                    </div>
                  </div>
                </div>

                {/* Outcome Probability Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={`${getOutcomeColor(sim.homeWinProb)}`}>
                      {homeName} {sim.homeWinProb.toFixed(1)}%
                    </span>
                    <span className={getOutcomeColor(sim.drawProb)}>
                      {t('pred.draw')} {sim.drawProb.toFixed(1)}%
                    </span>
                    <span className={`${getOutcomeColor(sim.awayWinProb)}`}>
                      {sim.awayWinProb.toFixed(1)}% {awayName}
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-700/50">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${sim.homeWinProb}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                      style={{ width: `${sim.drawProb}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${sim.awayWinProb}%` }}
                    />
                  </div>
                </div>

                {/* Key Stats Row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('pred.avgTotalGoals')}</div>
                    <div className="text-white font-bold text-sm">{sim.avgTotalGoals.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('pred.highScoringPercentage')}</div>
                    <div className="text-pink-400 font-bold text-sm">
                      {sim.goalDistribution.filter(g => g.goals >= 5).reduce((s, g) => s + g.probability, 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{t('pred.blowoutChance')}</div>
                    <div className={`font-bold text-sm ${sim.blowoutProbability > 10 ? 'text-orange-400' : 'text-slate-300'}`}>
                      {sim.blowoutProbability.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Clean Sheet Row */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <span className="text-slate-400 text-[10px]">{homeName} {t('pred.cleanSheetProb')}</span>
                    <div className="text-white font-bold text-sm">{sim.cleanSheetProbability.home.toFixed(0)}%</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <span className="text-slate-400 text-[10px]">{awayName} {t('pred.cleanSheetProb')}</span>
                    <div className="text-white font-bold text-sm">{sim.cleanSheetProbability.away.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Expand for more details */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setExpandedMatch(isExpanded ? null : pred.match.id)}
                    className="flex-1 py-2 text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-1"
                  >
                    {isExpanded ? t('pred.showLess') : t('pred.showExperts')}
                    <svg
                      className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded: Top Scores + Goal Distribution */}
              {isExpanded && (
                <div className="border-t border-slate-700/50 p-4 bg-slate-900/30">
                  {/* Top 10 Scores */}
                  <div className="mb-5">
                    <div className="text-xs text-slate-400 mb-2 font-medium">{t('pred.goalDistribution')} (Top 10)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {sim.topScores.slice(0, 10).map((score, i) => (
                        <div
                          key={`${score.homeScore}-${score.awayScore}`}
                          className={`bg-slate-800/60 border rounded-lg p-2 text-center ${
                            i === 0
                              ? 'border-emerald-500/40 bg-emerald-900/20'
                              : score.homeScore + score.awayScore >= 5
                              ? 'border-pink-500/30 bg-pink-900/10'
                              : 'border-slate-700/40'
                          }`}
                        >
                          <div className="text-white font-bold text-sm">
                            {score.homeScore}-{score.awayScore}
                          </div>
                          <div className="text-emerald-400 text-xs font-medium">{score.probability.toFixed(1)}%</div>
                          <div className="text-slate-500 text-[10px]">
                            {score.homeScore + score.awayScore} {t('pred.totalGoals').toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Goal Distribution Chart */}
                  <div className="mb-5">
                    <div className="text-xs text-slate-400 mb-2 font-medium">Total Goal Distribution</div>
                    <div className="flex items-end gap-1.5 h-20">
                      {sim.goalDistribution.slice(0, 10).map((g) => (
                        <div key={g.goals} className="flex-1 flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 mb-0.5">{g.probability.toFixed(1)}%</span>
                          <div
                            className={`w-full rounded-t transition-all duration-500 ${
                              g.goals >= 5 ? 'bg-gradient-to-t from-pink-500/60 to-purple-500/60' : 'bg-gradient-to-t from-emerald-500/60 to-cyan-500/60'
                            }`}
                            style={{ height: `${Math.max(g.probability * 3, 4)}px` }}
                          />
                          <span className="text-[10px] text-slate-500 mt-1">{g.goals}g</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crazy Scores Section */}
                  {sim.crazyScores.scores.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                        ⚡ {t('pred.crazyScore')} (Total ≥ 5 goals)
                        <span className="text-pink-400 ml-1">
                          {sim.crazyScores.totalProbability.toFixed(1)}% {t('pred.outcomeProb')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {sim.crazyScores.scores.map((score) => (
                          <div
                            key={`crazy-${score.homeScore}-${score.awayScore}`}
                            className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-lg p-2 text-center"
                          >
                            <div className="text-white font-bold text-sm bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                              {score.homeScore}-{score.awayScore}
                            </div>
                            <div className="text-pink-400 text-xs font-medium">{score.probability.toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
        <span className="text-[10px] text-slate-600">
          🎲 {t('pred.totalSimulations')}: {data.predictions[0]?.simulation.totalSimulations.toLocaleString() || '10,000'}
        </span>
      </div>
    </div>
  )
}
