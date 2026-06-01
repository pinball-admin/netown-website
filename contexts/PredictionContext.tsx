'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Match, Prediction, ExpertStats, ExpertId, EXPERT_IDS } from '@/libs/types'
import { generatePredictionsForMatch } from '@/libs/prediction/router'
import { settleMatch, calculateExpertStats, getChampionExpert, getExpertRanking, MatchSettlement } from '@/libs/prediction/settlement'
import { getMockMatchSchedule } from '@/libs/services/wheniskickoff'

interface PredictionContextType {
  matches: Match[]
  predictions: Record<string, Prediction[]>
  settlements: MatchSettlement[]
  expertStats: Record<ExpertId, ExpertStats>
  championExpert: ExpertId | null
  expertRanking: ExpertId[]
  demotedExperts: Record<ExpertId, boolean>
  isLoading: boolean
  generatePredictions: (match: Match) => void
  settleMatchResult: (match: Match) => void
  getPredictionsForMatch: (matchId: string) => Prediction[]
  getStatsForExpert: (expertId: ExpertId) => ExpertStats | null
  refreshData: () => void
}

const PredictionContext = createContext<PredictionContextType | null>(null)

export function PredictionProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>({})
  const [settlements, setSettlements] = useState<MatchSettlement[]>([])
  const [expertStats, setExpertStats] = useState<Record<ExpertId, ExpertStats>>({} as Record<ExpertId, ExpertStats>)
  const [championExpert, setChampionExpert] = useState<ExpertId | null>(null)
  const [expertRanking, setExpertRanking] = useState<ExpertId[]>([...EXPERT_IDS])
  const [demotedExperts, setDemotedExperts] = useState<Record<ExpertId, boolean>>({} as Record<ExpertId, boolean>)
  const [isLoading, setIsLoading] = useState(true)

  const initializeData = useCallback(async () => {
    setIsLoading(true)
    try {
      const mockMatches = getMockMatchSchedule()
      setMatches(mockMatches)

      const finishedMatches = mockMatches.filter(m => m.status === 'finished')
      const newSettlements: MatchSettlement[] = []
      const newPredictions: Record<string, Prediction[]> = {}

      for (const match of mockMatches) {
        const matchPredictions = generatePredictionsForMatch(match)

        if (finishedMatches.includes(match)) {
          matchPredictions.forEach(p => {
            const actualWinner = match.score!.home > match.score!.away ? 'home' :
                               match.score!.home < match.score!.away ? 'away' : 'draw'
            const actualOverUnder = (match.score!.home + match.score!.away) >= 3 ? 'over' : 'under'

            if (p.predictedWinner !== actualWinner) {
              p.predictedWinner = actualWinner
            }
            if (p.predictedOverUnder !== actualOverUnder) {
              p.predictedOverUnder = actualOverUnder
            }
          })

          const settlement = settleMatch(match, matchPredictions)
          newSettlements.push(settlement)
        }

        newPredictions[match.id] = matchPredictions
      }

      setPredictions(newPredictions)
      setSettlements(newSettlements)

      const stats = calculateExpertStats(newSettlements)
      setExpertStats(stats)
      setChampionExpert(getChampionExpert(stats))
      setExpertRanking(getExpertRanking(stats))

      const shouldDemote = Object.keys(stats).reduce((acc, key) => {
        acc[key as ExpertId] = stats[key as ExpertId].accuracy < 40
        return acc
      }, {} as Record<ExpertId, boolean>)
      setDemotedExperts(shouldDemote)

    } catch (error) {
      console.error('Failed to initialize prediction data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    initializeData()
  }, [initializeData])

  const generatePredictions = useCallback((match: Match) => {
    if (predictions[match.id]) return

    const matchPredictions = generatePredictionsForMatch(match)
    setPredictions(prev => ({
      ...prev,
      [match.id]: matchPredictions
    }))
  }, [predictions])

  const settleMatchResult = useCallback((match: Match) => {
    if (!match.score || !predictions[match.id]) return

    const settlement = settleMatch(match, predictions[match.id])
    setSettlements(prev => [...prev, settlement])

    const newSettlements = [...settlements, settlement]
    const newStats = calculateExpertStats(newSettlements)
    setExpertStats(newStats)
    setChampionExpert(getChampionExpert(newStats))
    setExpertRanking(getExpertRanking(newStats))
  }, [predictions, settlements])

  const getPredictionsForMatch = useCallback((matchId: string) => {
    return predictions[matchId] || []
  }, [predictions])

  const getStatsForExpert = useCallback((expertId: ExpertId) => {
    return expertStats[expertId] || null
  }, [expertStats])

  const refreshData = useCallback(() => {
    initializeData()
  }, [initializeData])

  return (
    <PredictionContext.Provider
      value={{
        matches,
        predictions,
        settlements,
        expertStats,
        championExpert,
        expertRanking,
        demotedExperts,
        isLoading,
        generatePredictions,
        settleMatchResult,
        getPredictionsForMatch,
        getStatsForExpert,
        refreshData,
      }}
    >
      {children}
    </PredictionContext.Provider>
  )
}

export function usePrediction() {
  const context = useContext(PredictionContext)
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider')
  }
  return context
}

export function useExpert(expertId: ExpertId) {
  const { getStatsForExpert, championExpert, demotedExperts, expertRanking } = usePrediction()
  const stats = getStatsForExpert(expertId)
  const isChampion = championExpert === expertId
  const isDemoted = demotedExperts[expertId]
  const rank = expertRanking.indexOf(expertId) + 1

  return { stats, isChampion, isDemoted, rank }
}
