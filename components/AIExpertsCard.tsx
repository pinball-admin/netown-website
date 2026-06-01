'use client'

import { useState } from 'react'
import { EXPERT_IDS, ExpertId } from '@/libs/types'
import { generateExpertPredictions } from '@/libs/prediction/ml-model'

interface AIExpertsCardProps {
  matchId: string
  homeTeam: string
  awayTeam: string
}

const EXPERT_INFO: Record<ExpertId, { name: string; avatar: string; specialty: string }> = {
  beckham_chen: { name: 'Beckham Chen', avatar: '🇬🇧', specialty: 'Home Win Specialist' },
  zidane_gao: { name: 'Zidane Gao', avatar: '🇫🇷', specialty: 'Draw Expert' },
  batistuta_zhang: { name: 'Batistuta Zhang', avatar: '🇦🇷', specialty: 'Away Win Tipster' },
  shearer_zhang: { name: 'Shearer Zhang', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', specialty: 'Over 2.5 Goals' },
  ronaldo_silva: { name: 'Ronaldo Silva', avatar: '🇧🇷', specialty: 'Under 2.5 Goals' },
}

export default function AIExpertsCard({ matchId, homeTeam, awayTeam }: AIExpertsCardProps) {
  const [predictions, setPredictions] = useState<Record<ExpertId, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const generatePredictions = () => {
    setLoading(true)
    setTimeout(() => {
      const mockMatch = {
        id: matchId,
        homeTeam: { id: 'HOME', name: homeTeam, shortName: 'HOM', flag: '🏠', group: 'A' },
        awayTeam: { id: 'AWAY', name: awayTeam, shortName: 'AWY', flag: '✈️', group: 'A' },
        date: new Date().toISOString(),
        time: '12:00',
        venue: 'Stadium',
        group: 'A',
        status: 'scheduled' as const,
        round: 'Group Stage',
      }
      const preds = generateExpertPredictions(mockMatch)
      setPredictions(preds)
      setLoading(false)
    }, 800)
  }

  const displayedExperts = showAll ? EXPERT_IDS : EXPERT_IDS.slice(0, 3)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {displayedExperts.map(expertId => {
          const info = EXPERT_INFO[expertId]
          const pred = predictions?.[expertId]

          return (
            <div
              key={expertId}
              className="bg-slate-800/80 border border-slate-600 rounded-xl p-4 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{info.avatar}</span>
                <div>
                  <div className="font-semibold text-sm">{info.name}</div>
                  <div className="text-xs text-amber-400">{info.specialty}</div>
                </div>
              </div>

              {pred ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prediction:</span>
                    <span className="font-semibold">
                      {pred.predictedWinner === 'home' ? `${homeTeam} Win` :
                       pred.predictedWinner === 'away' ? `${awayTeam} Win` : 'Draw'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Score:</span>
                    <span className="font-semibold">{pred.predictedScore.home}-{pred.predictedScore.away}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bet:</span>
                    <span className={pred.predictedOverUnder === 'over' ? 'text-emerald-400' : 'text-blue-400'}>
                      {pred.predictedOverUnder === 'over' ? 'Over 2.5' : 'Under 2.5'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-amber-400 font-semibold">{pred.confidence}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm text-center py-4">
                  Click generate to see prediction
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!predictions && (
          <button
            onClick={generatePredictions}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-6 py-3 rounded-full hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50"
          >
            {loading ? '🔮 Analyzing...' : '🔮 Get AI Predictions'}
          </button>
        )}

        {predictions && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All 5 Experts (${EXPERT_IDS.length})`}
          </button>
        )}
      </div>

      {predictions && (
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            💡 <strong className="text-amber-400">Pro Tip:</strong> Our AI experts use ELO rating system and historical H2H data
            to generate predictions. <span className="text-emerald-400">Follow the consensus for higher win rates!</span>
          </p>
        </div>
      )}
    </div>
  )
}
