/**
 * Mode B - Monte Carlo Simulation Engine
 * 
 * Runs 10,000 simulations per match using the Dixon-Coles score matrix
 * to discover "crazy" exciting scorelines and probability distributions.
 * 
 * Mode B answers: "What if this match goes wild?"
 * - Most likely scores (standard prediction)
 * - Most exciting possible outcomes (3-3, 4-3, 5-2, etc.)
 * - Probability of high-scoring games
 * - Distribution tail analysis
 */

import { getDixonColesModel, DixonColesPrediction } from './dixon-coles'
import { initializeEnsemble } from './ensemble-engine'

const SIMULATION_COUNT = 10000
const MAX_GOALS = 8
const CRAZY_GOAL_THRESHOLD = 5 // total goals >= this = "crazy"

export interface SimulationResult {
  homeScore: number
  awayScore: number
  count: number
  probability: number // percentage (0-100)
}

export interface ModeBPrediction {
  homeTeam: string
  awayTeam: string
  isNeutral: boolean

  // Aggregate stats
  totalSimulations: number
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  avgHomeGoals: number
  avgAwayGoals: number
  avgTotalGoals: number

  // Most likely scores (top 15)
  topScores: SimulationResult[]

  // Crazy/exciting scorelines (total goals >= 5)
  crazyScores: {
    scores: SimulationResult[]
    totalProbability: number
    avgTotalGoals: number
    mostLikelyCrazy: SimulationResult | null
  }

  // Goal distribution (total goals)
  goalDistribution: { goals: number; probability: number }[]

  // Outcome distribution by goal margin
  blowoutProbability: number // win by 3+ goals
  oneGoalGameProbability: number
  cleanSheetProbability: { home: number; away: number }

  // Score matrix sample
  expectedHomeGoals: number
  expectedAwayGoals: number
}

/**
 * Sample a score (i, j) from a 2D probability matrix using inverse transform
 */
function sampleFromMatrix(matrix: number[][]): { home: number; away: number } {
  const flat: { score: { home: number; away: number }; prob: number }[] = []
  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      if (matrix[i] && matrix[i][j] !== undefined && matrix[i][j] > 0) {
        flat.push({ score: { home: i, away: j }, prob: matrix[i][j] })
      }
    }
  }

  const r = Math.random()
  let cumulative = 0
  for (const item of flat) {
    cumulative += item.prob
    if (r <= cumulative) return item.score
  }
  return { home: 0, away: 0 }
}

/**
 * Run Monte Carlo simulation for a match
 * @param homeTeamId - Home team code (e.g. 'ARG')
 * @param awayTeamId - Away team code (e.g. 'BRA')
 * @param isNeutral - Whether the match is at neutral venue
 * @param simulations - Number of simulations (default 10,000)
 */
export function runModeBPrediction(
  homeTeamId: string,
  awayTeamId: string,
  isNeutral: boolean = true,
  simulations: number = SIMULATION_COUNT
): ModeBPrediction {
  const dixonColes = getDixonColesModel()
  const dcPred: DixonColesPrediction = dixonColes.predict(homeTeamId, awayTeamId, isNeutral)

  const scoreMatrix = dcPred.scoreMatrix
  const scoreCount = new Map<string, number>()
  let homeWins = 0
  let draws = 0
  let awayWins = 0
  let totalHomeGoals = 0
  let totalAwayGoals = 0
  let totalGoalsSum = 0
  const goalCounts = new Array(17).fill(0) // 0-16 total goals
  let blowouts = 0 // win by 3+
  let oneGoalGames = 0
  let homeCleanSheets = 0
  let awayCleanSheets = 0

  for (let s = 0; s < simulations; s++) {
    const result = sampleFromMatrix(scoreMatrix)
    const key = `${result.home}-${result.away}`

    // Track score counts
    scoreCount.set(key, (scoreCount.get(key) || 0) + 1)

    // Track outcomes
    if (result.home > result.away) {
      homeWins++
      if (result.home - result.away >= 3) blowouts++
      if (result.home - result.away === 1) oneGoalGames++
    } else if (result.home === result.away) {
      draws++
    } else {
      awayWins++
      if (result.away - result.home >= 3) blowouts++
      if (result.away - result.home === 1) oneGoalGames++
    }

    // Clean sheets
    if (result.away === 0) homeCleanSheets++
    if (result.home === 0) awayCleanSheets++

    // Track goals
    totalHomeGoals += result.home
    totalAwayGoals += result.away
    const total = result.home + result.away
    totalGoalsSum += total
    if (total < goalCounts.length) {
      goalCounts[total]++
    }
  }

  // Build top scores
  const sortedScores: SimulationResult[] = Array.from(scoreCount.entries())
    .map(([key, count]) => {
      const [h, a] = key.split('-').map(Number)
      return { homeScore: h, awayScore: a, count, probability: (count / simulations) * 100 }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Crazy scores (total goals >= 5)
  const crazyScoresList = sortedScores
    .filter(s => s.homeScore + s.awayScore >= CRAZY_GOAL_THRESHOLD)
    .sort((a, b) => b.count - a.count)

  const crazyTotalProb = crazyScoresList.reduce((sum, s) => sum + s.probability, 0)

  // Goal distribution
  const goalDistribution = goalCounts
    .map((count, goals) => ({
      goals,
      probability: (count / simulations) * 100,
    }))
    .filter(g => g.probability > 0.01)

  return {
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    isNeutral,
    totalSimulations: simulations,
    homeWinProb: (homeWins / simulations) * 100,
    drawProb: (draws / simulations) * 100,
    awayWinProb: (awayWins / simulations) * 100,
    avgHomeGoals: totalHomeGoals / simulations,
    avgAwayGoals: totalAwayGoals / simulations,
    avgTotalGoals: totalGoalsSum / simulations,
    topScores: sortedScores,
    crazyScores: {
      scores: crazyScoresList,
      totalProbability: crazyTotalProb,
      avgTotalGoals: crazyScoresList.length > 0
        ? crazyScoresList.reduce((sum, s) => sum + (s.homeScore + s.awayScore) * s.probability, 0) / crazyTotalProb
        : 0,
      mostLikelyCrazy: crazyScoresList[0] || null,
    },
    goalDistribution,
    blowoutProbability: blowouts / simulations * 100,
    oneGoalGameProbability: oneGoalGames / simulations * 100,
    cleanSheetProbability: {
      home: homeCleanSheets / simulations * 100,
      away: awayCleanSheets / simulations * 100,
    },
    expectedHomeGoals: dcPred.expectedHomeGoals,
    expectedAwayGoals: dcPred.expectedAwayGoals,
  }
}

/**
 * Run Mode B simulations for multiple matches
 */
export function runModeBForMatches(
  matches: { homeTeam: string; awayTeam: string; isNeutral?: boolean }[]
): ModeBPrediction[] {
  return matches.map(m => runModeBPrediction(m.homeTeam, m.awayTeam, m.isNeutral ?? true))
}

/**
 * Compare Mode B results with Mode A (ensemble) for a match
 */
export function compareModes(homeTeam: string, awayTeam: string) {
  const modeB = runModeBPrediction(homeTeam, awayTeam, true)

  return {
    modeB,
    comparisonPoints: {
      // Mode B typically shows more extreme outcomes in the tail
      crazyScoreUpside: modeB.crazyScores.mostLikelyCrazy
        ? `${modeB.crazyScores.mostLikelyCrazy.homeScore}-${modeB.crazyScores.mostLikelyCrazy.awayScore} (${modeB.crazyScores.mostLikelyCrazy.probability.toFixed(1)}%)`
        : 'None',

      excitingGameProb: modeB.goalDistribution
        .filter(g => g.goals >= 5)
        .reduce((sum, g) => sum + g.probability, 0)
        .toFixed(1) + '%',

      averageTotalGoals: modeB.avgTotalGoals.toFixed(2),
    },
  }
}
