import { Match, Prediction, ExpertStats, ExpertId, EXPERT_IDS } from '../types'

export interface SettlementResult {
  expertId: ExpertId
  correctResult: boolean
  correctScore: boolean
  correctOverUnder: boolean
  pointsEarned: number
  totalPoints: number
}

export interface MatchSettlement {
  matchId: string
  matchDate: string
  homeTeam: string
  awayTeam: string
  finalScore: { home: number; away: number }
  predictions: SettlementResult[]
  bestExpert: ExpertId | null
  bestExpertScore: number
  timestamp: string
}

const POINTS_CORRECT_RESULT = 1
const POINTS_CORRECT_SCORE = 3
const POINTS_CORRECT_OVER_UNDER = 1
const POINTS_BONUS_ALL_CORRECT = 5

export function settleMatch(
  match: Match,
  predictions: Prediction[]
): MatchSettlement {
  if (!match.score) {
    throw new Error('Match has no score - cannot settle')
  }

  const actualWinner = getActualWinner(match.score)
  const actualOverUnder = getActualOverUnder(match.score)

  const settlementResults: SettlementResult[] = predictions.map(pred => {
    const correctResult = pred.predictedWinner === actualWinner
    const correctScore = pred.predictedScore.home === match.score!.home &&
                         pred.predictedScore.away === match.score!.away
    const correctOverUnder = pred.predictedOverUnder === actualOverUnder

    let points = 0
    if (correctResult) points += POINTS_CORRECT_RESULT
    if (correctScore) points += POINTS_CORRECT_SCORE
    if (correctOverUnder) points += POINTS_CORRECT_OVER_UNDER
    if (correctResult && correctScore && correctOverUnder) {
      points += POINTS_BONUS_ALL_CORRECT
    }

    return {
      expertId: pred.expertId as ExpertId,
      correctResult,
      correctScore,
      correctOverUnder,
      pointsEarned: points,
      totalPoints: POINTS_CORRECT_RESULT + POINTS_CORRECT_SCORE + POINTS_CORRECT_OVER_UNDER + POINTS_BONUS_ALL_CORRECT,
    }
  })

  const bestResult = settlementResults.reduce<{ expert: ExpertId | null; score: number }>(
    (best, current) => {
      if (current.pointsEarned > best.score) {
        return { expert: current.expertId, score: current.pointsEarned }
      }
      return best
    },
    { expert: null, score: -1 }
  )

  return {
    matchId: match.id,
    matchDate: match.date,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    finalScore: match.score,
    predictions: settlementResults,
    bestExpert: bestResult.expert,
    bestExpertScore: bestResult.score,
    timestamp: new Date().toISOString(),
  }
}

function getActualWinner(score: { home: number; away: number }): 'home' | 'draw' | 'away' {
  if (score.home > score.away) return 'home'
  if (score.home < score.away) return 'away'
  return 'draw'
}

function getActualOverUnder(score: { home: number; away: number }): 'over' | 'under' {
  return (score.home + score.away) >= 3 ? 'over' : 'under'
}

export function calculateExpertStats(
  settlements: MatchSettlement[]
): Record<ExpertId, ExpertStats> {
  const stats: Record<ExpertId, ExpertStats> = {} as Record<ExpertId, ExpertStats>

  EXPERT_IDS.forEach(expertId => {
    const expertSettlements = settlements
      .flatMap(s => s.predictions)
      .filter(p => p.expertId === expertId)

    const totalMatches = expertSettlements.length
    const correctResults = expertSettlements.filter(p => p.correctResult).length
    const correctScores = expertSettlements.filter(p => p.correctScore).length
    const correctOverUnder = expertSettlements.filter(p => p.correctOverUnder).length
    const totalPoints = expertSettlements.reduce((sum, p) => sum + p.pointsEarned, 0)

    const recentSettlements = expertSettlements.slice(-5)
    const recentCorrect = recentSettlements.filter(p => p.correctResult).length

    const last5 = settlements.slice(-5)
    let streak = 0
  for (let i = last5.length - 1; i >= 0; i--) {
    const pred = last5[i].predictions.find(p => p.expertId === expertId)
    if (pred && pred.correctResult) {
      streak++
    } else {
      break
    }
  }

    const accuracy = totalMatches > 0 ? Math.round((correctResults / totalMatches) * 100) : 0
    const winRate = totalMatches > 0 ? Math.round((correctResults / totalMatches) * 100) : 0

    const medals: string[] = []
    if (streak >= 5) medals.push('🔥_hot_streak')
    if (accuracy >= 80) medals.push('🎯_sharp_shooter')
    if (correctScores >= 3) medals.push('💯_perfect_score')
    if (totalPoints >= 50) medals.push('🏆_top_expert')

    stats[expertId] = {
      expertId,
      totalMatches,
      correctResults,
      correctScores,
      correctOverUnder,
      totalPoints,
      winRate,
      accuracy,
      recentCorrect,
      recentTotal: Math.min(5, totalMatches),
      streak,
      rank: 0,
      isChampion: false,
      medals,
      lastUpdated: new Date().toISOString(),
    }
  })

  const sortedExperts = Object.values(stats).sort((a, b) => {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy
    if (b.correctScores !== a.correctScores) return b.correctScores - a.correctScores
    return b.totalPoints - a.totalPoints
  })

  sortedExperts.forEach((expert, index) => {
    const eId = expert.expertId as ExpertId
    stats[eId].rank = index + 1
    if (index === 0 && expert.totalMatches >= 3) {
      stats[eId].isChampion = true
    }
  })

  return stats
}

export function getChampionExpert(stats: Record<ExpertId, ExpertStats>): ExpertId | null {
  const champions = Object.values(stats).filter(s => s.isChampion)
  if (champions.length === 0) {
    const sorted = Object.values(stats).sort((a, b) => b.accuracy - a.accuracy)
    return sorted.length > 0 ? sorted[0].expertId as ExpertId : null
  }
  return champions[0].expertId as ExpertId
}

export function getExpertRanking(stats: Record<ExpertId, ExpertStats>): ExpertId[] {
  return Object.values(stats)
    .sort((a, b) => a.rank - b.rank)
    .map(s => s.expertId as ExpertId)
}

export function generateShareContent(
  expertId: ExpertId,
  stats: ExpertStats,
  recentMatch?: MatchSettlement
): { title: string; description: string; hashtags: string[] } {
  const expertNames: Record<ExpertId, string> = {
    beckham_chen: 'Beckham Chen',
    zidane_gao: 'Zidane Gao',
    batistuta_zhang: 'Batistuta Zhang',
    shearer_zhang: 'Shearer Zhang',
    ronaldo_silva: 'Ronaldo Silva',
  }

  const title = `🏆 ${expertNames[expertId]} - Netown Oracle Champion!`
  const description = recentMatch
    ? `Just predicted ${recentMatch.homeTeam} vs ${recentMatch.awayTeam} (${recentMatch.finalScore.home}-${recentMatch.finalScore.away}) with ${stats.accuracy}% accuracy!`
    : `${stats.accuracy}% prediction accuracy with ${stats.streak} win streak!`

  const hashtags = [
    '#Netown',
    '#WorldCup2026',
    '#AIpredictions',
    '#FootballOracle',
    '#NetownOracle',
  ]

  return { title, description, hashtags }
}

export function shouldDemoteExpert(stats: Record<ExpertId, ExpertStats>): Record<ExpertId, boolean> {
  const demotionThreshold = 40
  const result: Record<ExpertId, boolean> = {} as Record<ExpertId, boolean>

  EXPERT_IDS.forEach(expertId => {
    const expertStats = stats[expertId]
    const recentAccuracy = expertStats.recentTotal > 0
      ? (expertStats.recentCorrect / expertStats.recentTotal) * 100
      : 100

    result[expertId] = recentAccuracy < demotionThreshold
  })

  return result
}