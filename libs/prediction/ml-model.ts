import { Match, Team, TeamStats, Prediction, ExpertId, EXPERT_IDS } from '../types'
import { getMockTeamStats, getMockAllTeams } from '../services/football-data'
import { fetchMatchSchedule } from '../services/wheniskickoff'

export interface TeamElo {
  teamId: string
  elo: number
  attack: number
  defense: number
  homeAdvantage: number
  recentForm: number[]
  goalsScored: number[]
  goalsConceded: number[]
}

export interface MatchFeatures {
  eloDiff: number
  homeAdvantage: number
  attackDiff: number
  defenseDiff: number
  formDiff: number
  h2hHomeWins: number
  h2hDraws: number
  h2hAwayWins: number
  totalH2HMatches: number
  overChance: number
  underChance: number
}

const INITIAL_ELO = 1500
const ELO_K_FACTOR = 32
const HOME_ADVANTAGE_BASE = 100
const ATTACK_WEIGHT = 0.3
const DEFENSE_WEIGHT = 0.3
const ELO_WEIGHT = 0.4

const ELO_RATINGS: Record<string, number> = {
  'ARG': 1835, 'BRA': 1819, 'FRA': 1822, 'ENG': 1793, 'ESP': 1779,
  'GER': 1764, 'NED': 1753, 'ITA': 1735, 'POR': 1748, 'BEL': 1732,
  'CRO': 1718, 'URU': 1723, 'MEX': 1678, 'COL': 1692, 'USA': 1653,
  'SEN': 1679, 'MAR': 1671, 'JPN': 1668, 'KOR': 1645, 'AUS': 1642,
  'CAN': 1638, 'QAT': 1567, 'IRN': 1631, 'ECU': 1628, 'GHA': 1619,
  'CMR': 1608, 'PAR': 1603, 'PAN': 1589, 'NZL': 1562, 'UZB': 1558,
  'UGA': 1542, 'CRC': 1587,
}

const ATTACK_RATINGS: Record<string, number> = {
  'ARG': 85, 'BRA': 88, 'FRA': 86, 'ENG': 82, 'ESP': 83,
  'GER': 80, 'NED': 79, 'ITA': 76, 'POR': 81, 'BEL': 79,
  'CRO': 77, 'URU': 78, 'MEX': 74, 'COL': 75, 'USA': 72,
  'SEN': 73, 'MAR': 74, 'JPN': 75, 'KOR': 73, 'AUS': 71,
  'CAN': 70, 'QAT': 65, 'IRN': 70, 'ECU': 71, 'GHA': 68,
  'CMR': 67, 'PAR': 66, 'PAN': 63, 'NZL': 60, 'UZB': 62,
  'UGA': 58, 'CRC': 66,
}

const DEFENSE_RATINGS: Record<string, number> = {
  'ARG': 82, 'BRA': 80, 'FRA': 83, 'ENG': 81, 'ESP': 82,
  'GER': 82, 'NED': 81, 'ITA': 84, 'POR': 79, 'BEL': 78,
  'CRO': 80, 'URU': 77, 'MEX': 74, 'COL': 73, 'USA': 75,
  'SEN': 76, 'MAR': 81, 'JPN': 76, 'KOR': 75, 'AUS': 72,
  'CAN': 73, 'QAT': 70, 'IRN': 74, 'ECU': 72, 'GHA': 70,
  'CMR': 68, 'PAR': 69, 'PAN': 68, 'NZL': 65, 'UZB': 66,
  'UGA': 62, 'CRC': 71,
}

export class EloPredictionModel {
  private teamElos: Map<string, TeamElo> = new Map()

  constructor() {
    this.initializeTeamElos()
  }

  private initializeTeamElos() {
    const teams = getMockAllTeams()
    teams.forEach(team => {
      this.teamElos.set(team.id, {
        teamId: team.id,
        elo: ELO_RATINGS[team.id] || INITIAL_ELO,
        attack: ATTACK_RATINGS[team.id] || 70,
        defense: DEFENSE_RATINGS[team.id] || 70,
        homeAdvantage: HOME_ADVANTAGE_BASE + (team.ranking < 20 ? 10 : team.ranking < 50 ? 5 : 0),
        recentForm: [0.5, 0.5, 0.5, 0.5, 0.5],
        goalsScored: [1.5, 1.5, 1.5, 1.5, 1.5],
        goalsConceded: [1.2, 1.2, 1.2, 1.2, 1.2],
      })
    })
  }

  private getTeamElo(teamId: string): TeamElo {
    return this.teamElos.get(teamId) || {
      teamId,
      elo: INITIAL_ELO,
      attack: 70,
      defense: 70,
      homeAdvantage: HOME_ADVANTAGE_BASE,
      recentForm: [0.5, 0.5, 0.5, 0.5, 0.5],
      goalsScored: [1.5, 1.5, 1.5, 1.5, 1.5],
      goalsConceded: [1.2, 1.2, 1.2, 1.2, 1.2],
    }
  }

  extractFeatures(match: Match): MatchFeatures {
    const homeElo = this.getTeamElo(match.homeTeam.id)
    const awayElo = this.getTeamElo(match.awayTeam.id)

    const homeFormAvg = homeElo.recentForm.reduce((a, b) => a + b, 0) / homeElo.recentForm.length
    const awayFormAvg = awayElo.recentForm.reduce((a, b) => a + b, 0) / awayElo.recentForm.length

    const homeGoalsAvg = homeElo.goalsScored.reduce((a, b) => a + b, 0) / homeElo.goalsScored.length
    const awayGoalsConcededAvg = awayElo.goalsConceded.reduce((a, b) => a + b, 0) / awayElo.goalsConceded.length

    const awayGoalsAvg = awayElo.goalsScored.reduce((a, b) => a + b, 0) / awayElo.goalsScored.length
    const homeGoalsConcededAvg = homeElo.goalsConceded.reduce((a, b) => a + b, 0) / homeElo.goalsConceded.length

    const expectedHomeGoals = (homeGoalsAvg + awayGoalsConcededAvg) / 2
    const expectedAwayGoals = (awayGoalsAvg + homeGoalsConcededAvg) / 2

    const totalExpectedGoals = expectedHomeGoals + expectedAwayGoals
    const overThreshold = 2.5
    const overChance = this.calculateOverChance(totalExpectedGoals, overThreshold)

    return {
      eloDiff: (homeElo.elo + homeElo.homeAdvantage) - awayElo.elo,
      homeAdvantage: homeElo.homeAdvantage,
      attackDiff: homeElo.attack - awayElo.attack,
      defenseDiff: awayElo.defense - homeElo.defense,
      formDiff: homeFormAvg - awayFormAvg,
      h2hHomeWins: 2,
      h2hDraws: 1,
      h2hAwayWins: 2,
      totalH2HMatches: 5,
      overChance,
      underChance: 1 - overChance,
    }
  }

  private calculateOverChance(expectedGoals: number, threshold: number): number {
    const poissonOver = this.poissonProbability(expectedGoals, threshold)
    return Math.min(0.8, Math.max(0.2, poissonOver))
  }

  private poissonProbability(lambda: number, k: number): number {
    const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1)
    return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k)
  }

  predictOutcome(features: MatchFeatures): { homeWin: number; draw: number; awayWin: number } {
    const eloComponent = 1 / (1 + Math.pow(10, -features.eloDiff / 400))
    const formComponent = 0.5 + features.formDiff * 0.3
    const homeComponent = 1 / (1 + Math.pow(10, -features.homeAdvantage / 400))

    const combinedHome = ELO_WEIGHT * eloComponent + 0.3 * homeComponent + 0.3 * formComponent
    const combinedAway = 1 - combinedHome

    const drawBase = 0.25
    const drawFactor = 1 - Math.abs(combinedHome - combinedAway) * 0.5

    const total = combinedHome + combinedAway + drawBase * drawFactor
    const homeWin = combinedHome / total
    const awayWin = combinedAway / total
    const draw = (drawBase * drawFactor) / total

    return { homeWin, draw, awayWin }
  }

  predictScore(features: MatchFeatures): { home: number; away: number } {
    const { homeWin, draw, awayWin } = this.predictOutcome(features)

    const expectedGoals = features.overChance * 2.5 + (1 - features.overChance) * 1.8
    const homeAdvantageFactor = 1 + features.homeAdvantage / 2000

    let homeGoals = expectedGoals * homeAdvantageFactor * (homeWin + draw * 0.3)
    let awayGoals = expectedGoals * (awayWin + draw * 0.3)

    homeGoals = Math.max(0, Math.round(homeGoals * 10) / 10)
    awayGoals = Math.max(0, Math.round(awayGoals * 10) / 10)

    return {
      home: Math.floor(homeGoals),
      away: Math.floor(awayGoals),
    }
  }

  updateElo(winner: 'home' | 'away' | 'draw', homeGoals: number, awayGoals: number, match: Match) {
    const homeElo = this.getTeamElo(match.homeTeam.id)
    const awayElo = this.getTeamElo(match.awayTeam.id)

    const expectedHome = 1 / (1 + Math.pow(10, (awayElo.elo - homeElo.elo - homeElo.homeAdvantage) / 400))
    const expectedAway = 1 / (1 + Math.pow(10, (homeElo.elo + homeElo.homeAdvantage - awayElo.elo) / 400))

    let actualHome: number, actualAway: number
    if (winner === 'home') {
      actualHome = 1
      actualAway = 0
    } else if (winner === 'away') {
      actualHome = 0
      actualAway = 1
    } else {
      actualHome = 0.5
      actualAway = 0.5
    }

    const newHomeElo = homeElo.elo + ELO_K_FACTOR * (actualHome - expectedHome)
    const newAwayElo = awayElo.elo + ELO_K_FACTOR * (actualAway - expectedAway)

    homeElo.elo = newHomeElo
    awayElo.elo = newAwayElo

    homeElo.recentForm = [...homeElo.recentForm.slice(1), actualHome]
    awayElo.recentForm = [...awayElo.recentForm.slice(1), actualAway]

    homeElo.goalsScored = [...homeElo.goalsScored.slice(1), homeGoals]
    awayElo.goalsScored = [...awayElo.goalsScored.slice(1), awayGoals]
    homeElo.goalsConceded = [...homeElo.goalsConceded.slice(1), awayGoals]
    awayElo.goalsConceded = [...awayElo.goalsConceded.slice(1), homeGoals]

    this.teamElos.set(match.homeTeam.id, homeElo)
    this.teamElos.set(match.awayTeam.id, awayElo)
  }

  getPredictionForMatch(match: Match): {
    homeWin: number
    draw: number
    awayWin: number
    predictedScore: { home: number; away: number }
    over: number
    under: number
  } {
    const features = this.extractFeatures(match)
    const outcome = this.predictOutcome(features)
    const score = this.predictScore(features)

    return {
      homeWin: Math.round(outcome.homeWin * 100),
      draw: Math.round(outcome.draw * 100),
      awayWin: Math.round(outcome.awayWin * 100),
      predictedScore: score,
      over: Math.round(features.overChance * 100),
      under: Math.round(features.underChance * 100),
    }
  }
}

let globalModel: EloPredictionModel | null = null

export function getPredictionModel(): EloPredictionModel {
  if (typeof window !== 'undefined' && !globalModel) {
    globalModel = new EloPredictionModel()
  }
  if (!globalModel) {
    globalModel = new EloPredictionModel()
  }
  return globalModel
}

export function generateExpertPredictions(match: Match): Record<ExpertId, Prediction> {
  const model = getPredictionModel()
  const basePrediction = model.getPredictionForMatch(match)

  const expertOffsets: Record<ExpertId, { homeBias: number; drawBias: number; awayBias: number; overBias: number }> = {
    beckham_chen: { homeBias: 0.15, drawBias: -0.05, awayBias: -0.10, overBias: 0.05 },
    zidane_gao: { homeBias: -0.05, drawBias: 0.20, awayBias: -0.15, overBias: 0.00 },
    batistuta_zhang: { homeBias: -0.10, drawBias: -0.05, awayBias: 0.15, overBias: 0.08 },
    shearer_zhang: { homeBias: 0.05, drawBias: -0.05, awayBias: 0.00, overBias: 0.20 },
    ronaldo_silva: { homeBias: 0.00, drawBias: 0.00, awayBias: 0.00, overBias: -0.20 },
  }

  const predictions: Record<ExpertId, Prediction> = {} as Record<ExpertId, Prediction>

  EXPERT_IDS.forEach(expertId => {
    const offset = expertOffsets[expertId]

    let homeWin = Math.max(5, Math.min(90, basePrediction.homeWin + offset.homeBias * 100))
    let awayWin = Math.max(5, Math.min(90, basePrediction.awayWin + offset.awayBias * 100))
    let draw = Math.max(5, Math.min(60, basePrediction.draw + offset.drawBias * 100))

    const total = homeWin + draw + awayWin
    homeWin = Math.round((homeWin / total) * 100)
    draw = Math.round((draw / total) * 100)
    awayWin = 100 - homeWin - draw

    let over = Math.max(20, Math.min(90, basePrediction.over + offset.overBias * 100))
    const under = 100 - over

    const predictedHomeGoals = basePrediction.predictedScore.home
    const predictedAwayGoals = basePrediction.predictedScore.away

    const predictedWinner: 'home' | 'draw' | 'away' =
      homeWin > awayWin ? 'home' : awayWin > homeWin ? 'away' : 'draw'

    const predictedOverUnder: 'over' | 'under' = over > 50 ? 'over' : 'under'

    predictions[expertId] = {
      matchId: match.id,
      expertId,
      predictedWinner,
      predictedScore: { home: predictedHomeGoals, away: predictedAwayGoals },
      predictedOverUnder,
      overUnderLine: 2.5,
      confidence: Math.max(50, Math.min(95, Math.max(homeWin, draw, awayWin) + Math.round(Math.random() * 10))),
      reasoning: generateReasoning(expertId, match, homeWin, draw, awayWin, predictedHomeGoals, predictedAwayGoals, over),
    }
  })

  return predictions
}

function generateReasoning(
  expertId: ExpertId,
  match: Match,
  homeWin: number,
  draw: number,
  awayWin: number,
  homeGoals: number,
  awayGoals: number,
  over: number
): string {
  const expertReasons: Record<ExpertId, string[]> = {
    beckham_chen: [
      `Based on ${match.homeTeam.name}'s dominant home record and recent form, they have clear advantage`,
      `The home side's attacking prowess should prevail in this matchup`,
      `${match.homeTeam.name} has won ${Math.round(homeWin / 10)} of their last 10 home games`,
    ],
    zidane_gao: [
      `Both teams are well-matched, expecting a tightly contested affair`,
      `Historical encounters suggest this could go either way - draw is plausible`,
      `The tactical approaches of both sides likely cancel each other out`,
    ],
    batistuta_zhang: [
      `${match.awayTeam.name} has shown resilience and can exploit home side weaknesses`,
      `Away form has been impressive for ${match.awayTeam.name} recently`,
      `Counter-attacking opportunities will favor the visitors`,
    ],
    shearer_zhang: [
      `Expecting an open game with plenty of goal-scoring opportunities`,
      `Both defenses vulnerable to quick transitions`,
      `Over 2.5 goals looks promising based on recent scoring patterns`,
    ],
    ronaldo_silva: [
      `Defensive solidity from both sides suggests a low-scoring affair`,
      `Conservative approach expected, Under 2.5 is the value pick`,
      `Set pieces and mistakes might decide this tight match`,
    ],
  }

  const reasons = expertReasons[expertId]
  const baseReason = reasons[Math.floor(Math.random() * reasons.length)]

  const prediction = homeWin > awayWin ? `${match.homeTeam.name} win` :
                      awayWin > homeWin ? `${match.awayTeam.name} win` : 'Draw'

  return `${baseReason}. Predicted: ${prediction} ${homeGoals}-${awayGoals}. ${over > 50 ? 'Over 2.5 goals' : 'Under 2.5 goals'}.`
}

export function settlePrediction(
  prediction: Prediction,
  actualScore: { home: number; away: number }
): {
  correctResult: boolean
  correctScore: boolean
  correctOverUnder: boolean
  pointsEarned: number
} {
  const actualHomeWin = actualScore.home > actualScore.away
  const actualAwayWin = actualScore.away > actualScore.home
  const actualDraw = actualScore.home === actualScore.away
  const actualOver = actualScore.home + actualScore.away > 2.5
  const actualUnder = actualScore.home + actualScore.away < 2.5

  let correctResult = false
  if (prediction.predictedWinner === 'home' && actualHomeWin) correctResult = true
  if (prediction.predictedWinner === 'away' && actualAwayWin) correctResult = true
  if (prediction.predictedWinner === 'draw' && actualDraw) correctResult = true

  const correctScore = prediction.predictedScore.home === actualScore.home &&
                       prediction.predictedScore.away === actualScore.away

  let correctOverUnder = false
  if (prediction.predictedOverUnder === 'over' && actualOver) correctOverUnder = true
  if (prediction.predictedOverUnder === 'under' && actualUnder) correctOverUnder = true

  let pointsEarned = 0
  if (correctResult) pointsEarned += 1
  if (correctScore) pointsEarned += 3
  if (correctOverUnder) pointsEarned += 1
  if (correctResult && correctScore && correctOverUnder) pointsEarned += 5

  return {
    correctResult,
    correctScore,
    correctOverUnder,
    pointsEarned,
  }
}
