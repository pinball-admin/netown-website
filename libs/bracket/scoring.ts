// Bracket Scoring - Calculation rules for bracket predictions

import { BracketRound, getRoundMultiplier } from './timeline'

export interface ScoreResult {
  pointsEarned: number
  isCorrect: boolean
}

/**
 * Calculate points for a single bracket pick
 * - Base 1 point per correct pick × round multiplier
 */
export function calculatePickScore(
  round: BracketRound,
  isCorrect: boolean
): ScoreResult {
  if (!isCorrect) return { pointsEarned: 0, isCorrect: false }

  const multiplier = getRoundMultiplier(round)
  const pointsEarned = 1 * multiplier

  return { pointsEarned, isCorrect: true }
}

/**
 * Calculate total bracket score from individual picks
 * - Sum of all correct picks' points
 * - Bonus for perfect rounds
 * - Perfect bracket bonus (all correct)
 */
export function calculateTotalScore(
  results: { round: BracketRound; isCorrect: boolean }[]
): { total: number; bonuses: string[]; perfectRounds: number } {
  let total = 0
  const bonuses: string[] = []
  let perfectRounds = 0

  // Group by round
  const roundGroups: Record<string, { correct: number; total: number }> = {}

  for (const result of results) {
    if (!roundGroups[result.round]) {
      roundGroups[result.round] = { correct: 0, total: 0 }
    }
    roundGroups[result.round].total++

    if (result.isCorrect) {
      const { pointsEarned } = calculatePickScore(result.round, true)
      total += pointsEarned
      roundGroups[result.round].correct++
    }
  }

  // Bonus for perfect rounds
  for (const [round, stats] of Object.entries(roundGroups)) {
    if (stats.correct === stats.total && stats.total > 0) {
      perfectRounds++
      const bonus = 5 * getRoundMultiplier(round as BracketRound)
      total += bonus
      bonuses.push(`Perfect ${round.replace(/_/g, ' ')}: +${bonus}pts`)
    }
  }

  // Perfect bracket bonus (all picks correct)
  const totalPicks = Object.values(roundGroups).reduce((sum, r) => sum + r.total, 0)
  const totalCorrect = Object.values(roundGroups).reduce((sum, r) => sum + r.correct, 0)
  if (totalCorrect === totalPicks && totalPicks > 0) {
    total += 50
    bonuses.push('Perfect Bracket: +50pts 🏆')
  }

  return { total, bonuses, perfectRounds }
}

/**
 * Calculate candy reward based on bracket score
 * - Entry fee: 100 candy
 * - Base reward: score × 2 candy
 * - Top 10% bonus: extra 100 candy
 */
export function calculateCandyReward(
  totalScore: number,
  rankPercentile: number
): number {
  const base = totalScore * 2
  let bonus = 0

  if (rankPercentile <= 0.1) {
    bonus = 100 // Top 10%
  } else if (rankPercentile <= 0.25) {
    bonus = 50 // Top 25%
  } else if (rankPercentile <= 0.5) {
    bonus = 20 // Top 50%
  }

  return base + bonus
}
