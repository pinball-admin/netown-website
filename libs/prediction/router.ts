import { Match, Prediction, ExpertId, OutcomeType, ExpertPreference, EXPERT_IDS, OUTCOMES } from '../types'

export interface RouterConfig {
  ensureCoverage: boolean
  minConfidence: number
  maxConfidence: number
  randomnessFactor: number
}

export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  ensureCoverage: true,
  minConfidence: 55,
  maxConfidence: 95,
  randomnessFactor: 0.15,
}

export const EXPERT_PREFERENCES: Record<ExpertId, ExpertPreference> = {
  beckham_chen: {
    outcomeBias: 'home_win',
    riskTolerance: 0.3,
    optimismFactor: 0.7,
    conservativeHomeBias: 0.8,
  },
  zidane_gao: {
    outcomeBias: 'draw',
    riskTolerance: 0.5,
    optimismFactor: 0.5,
    conservativeHomeBias: 0.4,
  },
  batistuta_zhang: {
    outcomeBias: 'away_win',
    riskTolerance: 0.7,
    optimismFactor: 0.9,
    conservativeHomeBias: 0.2,
  },
  shearer_zhang: {
    outcomeBias: 'over',
    riskTolerance: 0.6,
    optimismFactor: 0.6,
    conservativeHomeBias: 0.5,
  },
  ronaldo_silva: {
    outcomeBias: 'under',
    riskTolerance: 0.4,
    optimismFactor: 0.8,
    conservativeHomeBias: 0.6,
  },
}

export function calculateBasePrediction(
  match: Match,
  expertId: ExpertId
): { winner: 'home' | 'draw' | 'away'; score: { home: number; away: number }; overUnder: 'over' | 'under' } {
  const homeAdvantage = 0.15
  const preference = EXPERT_PREFERENCES[expertId]

  const homeStrength = 0.5 + homeAdvantage * preference.conservativeHomeBias
  const randomFactor = (Math.random() - 0.5) * 2 * preference.riskTolerance

  let homeProb = homeStrength + randomFactor
  let awayProb = (1 - homeStrength) + randomFactor * 0.5
  let drawProb = 0.25 - Math.abs(randomFactor) * 0.1

  const total = homeProb + awayProb + drawProb
  homeProb /= total
  awayProb /= total
  drawProb /= total

  let winner: 'home' | 'draw' | 'away'
  const rand = Math.random()
  if (rand < homeProb) {
    winner = 'home'
  } else if (rand < homeProb + drawProb) {
    winner = 'draw'
  } else {
    winner = 'away'
  }

  let baseGoals = 2.2 * preference.optimismFactor
  const variance = (Math.random() - 0.5) * 1.5

  let homeGoals: number
  let awayGoals: number

  if (winner === 'home') {
    homeGoals = Math.round(baseGoals + Math.random() * 1.5 + 0.5)
    awayGoals = Math.round(baseGoals * 0.6 + variance)
  } else if (winner === 'away') {
    homeGoals = Math.round(baseGoals * 0.6 + variance)
    awayGoals = Math.round(baseGoals + Math.random() * 1.5 + 0.5)
  } else {
    homeGoals = Math.round(baseGoals + variance * 0.5)
    awayGoals = homeGoals
  }

  homeGoals = Math.max(0, Math.min(6, homeGoals))
  awayGoals = Math.max(0, Math.min(6, awayGoals))

  const totalGoals = homeGoals + awayGoals
  const overUnder: 'over' | 'under' = totalGoals >= 2.5 ? 'over' : 'under'

  return { winner, score: { home: homeGoals, away: awayGoals }, overUnder }
}

export function ensureOutcomeCoverage(
  predictions: Prediction[],
  match: Match
): Prediction[] {
  if (predictions.length < 5) return predictions

  const coveredOutcomes = new Set<OutcomeType>()
  const neededOutcomes: OutcomeType[] = []

  predictions.forEach(p => {
    const outcome = getOutcomeFromPrediction(p)
    coveredOutcomes.add(outcome)
  })

  OUTCOMES.forEach(outcome => {
    if (!coveredOutcomes.has(outcome)) {
      neededOutcomes.push(outcome)
    }
  })

  if (neededOutcomes.length === 0) return predictions

  const outcomeToExpert: Record<OutcomeType, ExpertId> = {
    home_win: 'beckham_chen',
    draw: 'zidane_gao',
    away_win: 'batistuta_zhang',
    over: 'shearer_zhang',
    under: 'ronaldo_silva',
  }

  const expertToOutcome: Record<ExpertId, OutcomeType> = {
    beckham_chen: 'home_win',
    zidane_gao: 'draw',
    batistuta_zhang: 'away_win',
    shearer_zhang: 'over',
    ronaldo_silva: 'under',
  }

  const expertIndex = new Map<ExpertId, number>()
  predictions.forEach((p, i) => {
    expertIndex.set(p.expertId as ExpertId, i)
  })

  for (const neededOutcome of neededOutcomes) {
    const targetExpert = outcomeToExpert[neededOutcome]
    const predIndex = expertIndex.get(targetExpert)

    if (predIndex !== undefined) {
      const pred = predictions[predIndex]
      const adjusted = adjustPredictionForOutcome(pred, match, neededOutcome)
      predictions[predIndex] = adjusted
    }
  }

  return predictions
}

function getOutcomeFromPrediction(pred: Prediction): OutcomeType {
  if (pred.predictedWinner === 'home') return 'home_win'
  if (pred.predictedWinner === 'away') return 'away_win'
  return 'draw'
}

function adjustPredictionForOutcome(
  pred: Prediction,
  match: Match,
  targetOutcome: OutcomeType
): Prediction {
  const config = DEFAULT_ROUTER_CONFIG
  let newScore = { ...pred.predictedScore }
  let newWinner: 'home' | 'draw' | 'away' = pred.predictedWinner

  switch (targetOutcome) {
    case 'home_win':
      newWinner = 'home'
      newScore.home = Math.max(newScore.home + 1, 2)
      break
    case 'draw':
      newWinner = 'draw'
      newScore.home = Math.round((newScore.home + newScore.away) / 2)
      newScore.away = newScore.home
      break
    case 'away_win':
      newWinner = 'away'
      newScore.away = Math.max(newScore.away + 1, 2)
      break
    case 'over':
      pred.predictedOverUnder = 'over'
      newScore.home = Math.max(newScore.home, 2)
      newScore.away = Math.max(newScore.away, 2)
      const total = newScore.home + newScore.away
      if (total < 3) {
        newScore.home += 1
      }
      break
    case 'under':
      pred.predictedOverUnder = 'under'
      if (newScore.home + newScore.away >= 3) {
        const reduceBy = Math.min(newScore.home, newScore.away, newScore.home + newScore.away - 2)
        newScore.home -= Math.floor(reduceBy / 2)
        newScore.away -= Math.ceil(reduceBy / 2)
      }
      break
  }

  return {
    ...pred,
    predictedWinner: newWinner,
    predictedScore: newScore,
    predictedOverUnder: targetOutcome === 'over' || targetOutcome === 'under'
      ? targetOutcome
      : pred.predictedOverUnder,
    confidence: Math.min(config.maxConfidence, pred.confidence + 5),
  }
}

export function generatePredictionsForMatch(
  match: Match,
  config: RouterConfig = DEFAULT_ROUTER_CONFIG
): Prediction[] {
  const predictions: Prediction[] = EXPERT_IDS.map(expertId => {
    const basePred = calculateBasePrediction(match, expertId)
    const preference = EXPERT_PREFERENCES[expertId]

    const confidenceRange = config.maxConfidence - config.minConfidence
    const baseConfidence = config.minConfidence + Math.random() * confidenceRange
    const adjustedConfidence = Math.round(
      baseConfidence * preference.optimismFactor
    )

    return {
      expertId,
      matchId: match.id,
      predictedWinner: basePred.winner,
      predictedScore: basePred.score,
      predictedOverUnder: basePred.overUnder,
      overUnderLine: 2.5,
      confidence: Math.min(config.maxConfidence, Math.max(config.minConfidence, adjustedConfidence)),
      reasoning: generateReasoning(expertId, match, basePred),
    }
  })

  if (config.ensureCoverage) {
    return ensureOutcomeCoverage(predictions, match)
  }

  return predictions
}

function generateReasoning(
  expertId: ExpertId,
  match: Match,
  prediction: { winner: 'home' | 'draw' | 'away'; score: { home: number; away: number }; overUnder: 'over' | 'under' }
): string {
  const preference = EXPERT_PREFERENCES[expertId]
  const homeName = match.homeTeam.name
  const awayName = match.awayTeam.name

  const openingPhrases = [
    `Based on my ${preference.riskTolerance > 0.5 ? 'aggressive' : 'conservative'} analysis,`,
    `According to my predictive models,`,
    `My ${Math.round(preference.optimismFactor * 100)}% confidence level indicates,`,
    `Evaluating the historical data,`,
    `Considering the current form,`,
  ]

  const opening = openingPhrases[Math.floor(Math.random() * openingPhrases.length)]

  if (prediction.winner === 'home') {
    return `${opening} ${homeName} has the edge with home advantage.`
  } else if (prediction.winner === 'away') {
    return `${opening} ${awayName} shows superior tactical preparation.`
  } else {
    return `${opening} Both teams are evenly matched - draw is likely.`
  }
}

export function getExpertByOutcome(outcome: OutcomeType): ExpertId {
  const mapping: Record<OutcomeType, ExpertId> = {
    home_win: 'beckham_chen',
    draw: 'zidane_gao',
    away_win: 'batistuta_zhang',
    over: 'shearer_zhang',
    under: 'ronaldo_silva',
  }
  return mapping[outcome]
}

export function getExpertOrderForMatch(match: Match): ExpertId[] {
  return [...EXPERT_IDS]
}

export function validatePredictionCoverage(predictions: Prediction[]): boolean {
  const outcomes = predictions.map(p => getOutcomeFromPrediction(p))
  const uniqueOutcomes = new Set(outcomes)

  return uniqueOutcomes.size >= 3
}