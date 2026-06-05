'use client'

import React, { createContext, useContext, useState } from 'react'
import { ExpertStats, ExpertId, EXPERT_IDS } from '@/libs/types'

interface PredictionContextType {
  expertStats: Record<ExpertId, ExpertStats>
  championExpert: ExpertId | null
  expertRanking: ExpertId[]
  demotedExperts: Record<ExpertId, boolean>
  isLoading: boolean
  getStatsForExpert: (expertId: ExpertId) => ExpertStats | null
}

const PredictionContext = createContext<PredictionContextType | null>(null)

export function PredictionProvider({ children }: { children: React.ReactNode }) {
  const [expertStats] = useState<Record<ExpertId, ExpertStats>>(() => {
    const defaults = {} as Record<ExpertId, ExpertStats>
    EXPERT_IDS.forEach((id) => {
      defaults[id] = {
        expertId: id,
        totalMatches: 0,
        correctResults: 0,
        correctScores: 0,
        correctOverUnder: 0,
        totalPoints: 0,
        winRate: 0,
        accuracy: 0,
        recentCorrect: 0,
        recentTotal: 0,
        streak: 0,
        rank: 0,
        isChampion: false,
        medals: [],
        lastUpdated: new Date().toISOString(),
      }
    })
    return defaults
  })
  const [championExpert] = useState<ExpertId | null>(null)
  const [expertRanking] = useState<ExpertId[]>([...EXPERT_IDS])
  const [demotedExperts] = useState<Record<ExpertId, boolean>>(() => {
    const defaults = {} as Record<ExpertId, boolean>
    EXPERT_IDS.forEach((id) => { defaults[id] = false })
    return defaults
  })
  const [isLoading] = useState(false)

  const getStatsForExpert = (expertId: ExpertId): ExpertStats | null => {
    return expertStats[expertId] || null
  }

  return (
    <PredictionContext.Provider
      value={{
        expertStats,
        championExpert,
        expertRanking,
        demotedExperts,
        isLoading,
        getStatsForExpert,
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
