/**
 * Dixon-Coles Model for Football Match Prediction
 * 
 * Based on: "Modelling Association Football Scores and Inefficiencies 
 * in the Football Betting Market" by Mark J. Dixon & Stuart G. Coles (1997)
 * 
 * This is the gold standard model for football prediction. It uses:
 * 1. Poisson regression for goal scoring
 * 2. Attack/defense strength parameters per team
 * 3. Home advantage factor
 * 4. Low-score draw correction (τ function)
 * 5. Time-decay weighting for recent matches
 */

export interface HistoricalMatch {
  date: string
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
  competition?: string
  weight?: number // time-decay weight
}

export interface TeamParameters {
  attack: number   // αi: attack strength
  defense: number  // βi: defense strength
  homeAdvantage: number
  recentForm: number[]  // last N match results (1=win, 0.5=draw, 0=loss)
  goalsScoredRecent: number[]
  goalsConcededRecent: number[]
}

export interface DixonColesPrediction {
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  expectedHomeGoals: number
  expectedAwayGoals: number
  mostLikelyScore: { home: number; away: number }
  scoreMatrix: number[][] // P(home=i, away=j)
  overProb: { [line: string]: number } // e.g., "1.5", "2.5", "3.5"
  bttsProb: number // both teams to score
  halfTimeExpected: { home: number; away: number }
  goalDistribution: { goals: number; probability: number }[]
}

// Default attack/defense parameters based on FIFA rankings + recent international form
const DEFAULT_PARAMS: Record<string, { attack: number; defense: number }> = {
  'ARG': { attack: 1.65, defense: 0.62 },
  'FRA': { attack: 1.58, defense: 0.64 },
  'BRA': { attack: 1.62, defense: 0.68 },
  'ENG': { attack: 1.52, defense: 0.65 },
  'ESP': { attack: 1.55, defense: 0.60 },
  'GER': { attack: 1.48, defense: 0.68 },
  'NED': { attack: 1.45, defense: 0.70 },
  'POR': { attack: 1.50, defense: 0.72 },
  'ITA': { attack: 1.35, defense: 0.58 },
  'BEL': { attack: 1.42, defense: 0.72 },
  'CRO': { attack: 1.38, defense: 0.68 },
  'URU': { attack: 1.35, defense: 0.72 },
  'COL': { attack: 1.32, defense: 0.74 },
  'MEX': { attack: 1.25, defense: 0.78 },
  'USA': { attack: 1.22, defense: 0.76 },
  'MAR': { attack: 1.28, defense: 0.65 },
  'SEN': { attack: 1.22, defense: 0.75 },
  'JPN': { attack: 1.30, defense: 0.72 },
  'KOR': { attack: 1.22, defense: 0.78 },
  'AUS': { attack: 1.15, defense: 0.82 },
  'CAN': { attack: 1.10, defense: 0.85 },
  'IRN': { attack: 1.12, defense: 0.80 },
  'ECU': { attack: 1.12, defense: 0.85 },
  'SUI': { attack: 1.25, defense: 0.72 },
  'DEN': { attack: 1.30, defense: 0.70 },
  'SRB': { attack: 1.22, defense: 0.82 },
  'TUR': { attack: 1.25, defense: 0.80 },
  'UKR': { attack: 1.12, defense: 0.85 },
  'POL': { attack: 1.15, defense: 0.82 },
  'NOR': { attack: 1.18, defense: 0.80 },
  'SWE': { attack: 1.18, defense: 0.78 },
  'GRE': { attack: 1.05, defense: 0.85 },
  'AUT': { attack: 1.15, defense: 0.82 },
  'CHI': { attack: 1.18, defense: 0.78 },
  'ALG': { attack: 1.15, defense: 0.82 },
  'NGA': { attack: 1.10, defense: 0.88 },
  'GHA': { attack: 1.05, defense: 0.88 },
  'CMR': { attack: 1.05, defense: 0.88 },
  'KSA': { attack: 1.00, defense: 0.92 },
  'QAT': { attack: 0.95, defense: 0.95 },
  'PAN': { attack: 0.92, defense: 0.95 },
  'NZL': { attack: 0.85, defense: 1.05 },
  'CRC': { attack: 0.98, defense: 0.88 },
  'WAL': { attack: 1.02, defense: 0.88 },
  'FIN': { attack: 0.95, defense: 0.92 },
  'JAM': { attack: 0.90, defense: 0.95 },
  'PER': { attack: 0.95, defense: 0.92 },
  'PAR': { attack: 0.95, defense: 0.88 },
  'VEN': { attack: 0.85, defense: 1.00 },
  'ROM': { attack: 0.98, defense: 0.88 },
  'TUN': { attack: 1.08, defense: 0.82 },
  'CZE': { attack: 1.10, defense: 0.85 },
  'HUN': { attack: 1.08, defense: 0.88 },
  'SCO': { attack: 1.02, defense: 0.88 },
}

const HOME_ADVANTAGE = 0.35 // γ: home advantage parameter
const RHO = -0.13           // ρ: correlation parameter for low-scoring games
const MAX_GOALS = 8         // compute score matrix up to this many goals

export class DixonColesModel {
  private teamParams: Map<string, TeamParameters> = new Map()
  private historicalMatches: HistoricalMatch[] = []

  constructor() {
    this.initializeDefaultParams()
  }

  private initializeDefaultParams() {
    for (const [teamId, params] of Object.entries(DEFAULT_PARAMS)) {
      this.teamParams.set(teamId, {
        attack: params.attack,
        defense: params.defense,
        homeAdvantage: HOME_ADVANTAGE,
        recentForm: [0.5, 0.5, 0.5, 0.5, 0.5],
        goalsScoredRecent: [1.2, 1.2, 1.2, 1.2, 1.2],
        goalsConcededRecent: [1.0, 1.0, 1.0, 1.0, 1.0],
      })
    }
  }

  /**
   * Update team parameters from historical match data
   * Uses time-decay weighting (more recent matches weigh more)
   */
  updateFromHistoricalData(matches: HistoricalMatch[]) {
    this.historicalMatches = matches

    // Group matches by team
    const teamMatches = new Map<string, HistoricalMatch[]>()
    
    for (const match of matches) {
      if (!teamMatches.has(match.homeTeam)) teamMatches.set(match.homeTeam, [])
      if (!teamMatches.has(match.awayTeam)) teamMatches.set(match.awayTeam, [])
      teamMatches.get(match.homeTeam)!.push(match)
      teamMatches.get(match.awayTeam)!.push(match)
    }

    // Calculate attack/defense strengths from data
    for (const [teamId, teamMatchList] of Array.from(teamMatches.entries())) {
      const sorted = (teamMatchList as HistoricalMatch[]).sort((a: HistoricalMatch, b: HistoricalMatch) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      // Time-decay weights: recent matches get higher weight
      const now = Date.now()
      const weightedGoalsScored: number[] = []
      const weightedGoalsConceded: number[] = []
      const formResults: number[] = []

      for (const m of sorted.slice(0, 20)) { // last 20 matches
        const daysAgo = (now - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24)
        const decay = Math.exp(-daysAgo / 365) // 1-year half-life
        
        const isHome = m.homeTeam === teamId
        const scored = isHome ? m.homeGoals : m.awayGoals
        const conceded = isHome ? m.awayGoals : m.homeGoals

        weightedGoalsScored.push(scored * decay)
        weightedGoalsConceded.push(conceded * decay)

        if (scored > conceded) formResults.push(1 * decay)
        else if (scored === conceded) formResults.push(0.5 * decay)
        else formResults.push(0 * decay)
      }

      const avgScored = weightedGoalsScored.length > 0
        ? weightedGoalsScored.reduce((a, b) => a + b, 0) / weightedGoalsScored.length
        : 1.2
      const avgConceded = weightedGoalsConceded.length > 0
        ? weightedGoalsConceded.reduce((a, b) => a + b, 0) / weightedGoalsConceded.length
        : 1.0

      // Calculate attack and defense parameters relative to league average
      const leagueAvgGoals = 1.35 // average goals per team in international football
      const attackStrength = avgScored / leagueAvgGoals
      const defenseStrength = avgConceded / leagueAvgGoals

      const existing = this.teamParams.get(teamId)
      if (existing) {
        // Blend: 60% data-driven, 40% prior (to avoid overfitting with limited data)
        existing.attack = 0.6 * attackStrength + 0.4 * existing.attack
        existing.defense = 0.6 * defenseStrength + 0.4 * existing.defense
        existing.recentForm = formResults.slice(0, 5).length > 0 ? formResults.slice(0, 5) : existing.recentForm
        existing.goalsScoredRecent = weightedGoalsScored.slice(0, 5)
        existing.goalsConcededRecent = weightedGoalsConceded.slice(0, 5)
      } else {
        this.teamParams.set(teamId, {
          attack: attackStrength,
          defense: defenseStrength,
          homeAdvantage: HOME_ADVANTAGE,
          recentForm: formResults.slice(0, 5),
          goalsScoredRecent: weightedGoalsScored.slice(0, 5),
          goalsConcededRecent: weightedGoalsConceded.slice(0, 5),
        })
      }
    }
  }

  /**
   * Get team parameters, with fallback for unknown teams
   */
  getTeamParams(teamId: string): TeamParameters {
    return this.teamParams.get(teamId) || {
      attack: 1.0,
      defense: 1.0,
      homeAdvantage: HOME_ADVANTAGE,
      recentForm: [0.5, 0.5, 0.5, 0.5, 0.5],
      goalsScoredRecent: [1.0, 1.0, 1.0, 1.0, 1.0],
      goalsConcededRecent: [1.0, 1.0, 1.0, 1.0, 1.0],
    }
  }

  /**
   * Core Poisson probability: P(X = k) = (λ^k * e^(-λ)) / k!
   */
  private poisson(lambda: number, k: number): number {
    if (lambda <= 0) return k === 0 ? 1 : 0
    let logProb = -lambda + k * Math.log(lambda)
    for (let i = 2; i <= k; i++) {
      logProb -= Math.log(i)
    }
    return Math.exp(logProb)
  }

  /**
   * Dixon-Coles τ correction factor for low-scoring games
   * Adjusts probabilities for 0-0, 1-0, 0-1, 1-1 results
   */
  private tauCorrection(x: number, y: number, lambda: number, mu: number): number {
    if (x === 0 && y === 0) return 1 - lambda * mu * RHO
    if (x === 0 && y === 1) return 1 + lambda * RHO
    if (x === 1 && y === 0) return 1 + mu * RHO
    if (x === 1 && y === 1) return 1 - RHO
    return 1
  }

  /**
   * Calculate expected goals for each team
   * λi = αi * βj * γ  (home team expected goals)
   * μj = αj * βi      (away team expected goals)
   */
  calculateExpectedGoals(homeTeamId: string, awayTeamId: string, isNeutral: boolean = false): {
    expectedHome: number
    expectedAway: number
  } {
    const home = this.getTeamParams(homeTeamId)
    const away = this.getTeamParams(awayTeamId)

    // Home expected goals: home_attack * away_defense * home_advantage
    const homeAdv = isNeutral ? 1.0 : (1 + home.homeAdvantage)
    const expectedHome = home.attack * away.defense * homeAdv * 1.35 // 1.35 = league avg

    // Away expected goals: away_attack * home_defense
    const expectedAway = away.attack * home.defense * 1.35

    return {
      expectedHome: Math.max(0.3, Math.min(4.5, expectedHome)),
      expectedAway: Math.max(0.3, Math.min(4.5, expectedAway)),
    }
  }

  /**
   * Build the full score probability matrix using Dixon-Coles
   * P(X=i, Y=j) = τ(i,j,λ,μ) * Poisson(i;λ) * Poisson(j;μ)
   */
  buildScoreMatrix(lambda: number, mu: number): number[][] {
    const matrix: number[][] = []
    let totalProb = 0

    for (let i = 0; i <= MAX_GOALS; i++) {
      matrix[i] = []
      for (let j = 0; j <= MAX_GOALS; j++) {
        const tau = this.tauCorrection(i, j, lambda, mu)
        const prob = tau * this.poisson(lambda, i) * this.poisson(mu, j)
        matrix[i][j] = prob
        totalProb += prob
      }
    }

    // Normalize to ensure probabilities sum to 1
    for (let i = 0; i <= MAX_GOALS; i++) {
      for (let j = 0; j <= MAX_GOALS; j++) {
        matrix[i][j] /= totalProb
      }
    }

    return matrix
  }

  /**
   * Predict match outcome with full analysis
   */
  predict(homeTeamId: string, awayTeamId: string, isNeutral: boolean = false): DixonColesPrediction {
    const { expectedHome, expectedAway } = this.calculateExpectedGoals(homeTeamId, awayTeamId, isNeutral)

    // Apply form adjustment (recent 5 matches)
    const homeParams = this.getTeamParams(homeTeamId)
    const awayParams = this.getTeamParams(awayTeamId)

    const homeFormAvg = homeParams.recentForm.length > 0
      ? homeParams.recentForm.reduce((a, b) => a + b, 0) / homeParams.recentForm.length
      : 0.5
    const awayFormAvg = awayParams.recentForm.length > 0
      ? awayParams.recentForm.reduce((a, b) => a + b, 0) / awayParams.recentForm.length
      : 0.5

    // Form adjustment: ±10% based on form differential
    const formDiff = homeFormAvg - awayFormAvg
    const lambda = expectedHome * (1 + formDiff * 0.1)
    const mu = expectedAway * (1 - formDiff * 0.1)

    // Build score matrix
    const scoreMatrix = this.buildScoreMatrix(lambda, mu)

    // Calculate win/draw/loss probabilities
    let homeWinProb = 0
    let drawProb = 0
    let awayWinProb = 0

    for (let i = 0; i <= MAX_GOALS; i++) {
      for (let j = 0; j <= MAX_GOALS; j++) {
        if (i > j) homeWinProb += scoreMatrix[i][j]
        else if (i === j) drawProb += scoreMatrix[i][j]
        else awayWinProb += scoreMatrix[i][j]
      }
    }

    // Find most likely score
    let maxProb = 0
    let mostLikelyScore = { home: 1, away: 0 }
    for (let i = 0; i <= MAX_GOALS; i++) {
      for (let j = 0; j <= MAX_GOALS; j++) {
        if (scoreMatrix[i][j] > maxProb) {
          maxProb = scoreMatrix[i][j]
          mostLikelyScore = { home: i, away: j }
        }
      }
    }

    // Over/Under probabilities
    const overProb: { [line: string]: number } = {}
    for (const line of [1.5, 2.5, 3.5]) {
      let under = 0
      for (let i = 0; i <= MAX_GOALS; i++) {
        for (let j = 0; j <= MAX_GOALS; j++) {
          if (i + j < line) under += scoreMatrix[i][j]
        }
      }
      overProb[line.toString()] = 1 - under
    }

    // Both teams to score
    let bttsProb = 0
    for (let i = 1; i <= MAX_GOALS; i++) {
      for (let j = 1; j <= MAX_GOALS; j++) {
        bttsProb += scoreMatrix[i][j]
      }
    }

    // Half-time expected goals (~42% of full-time goals)
    const htRatio = 0.42
    const halfTimeExpected = {
      home: Math.round(lambda * htRatio * 10) / 10,
      away: Math.round(mu * htRatio * 10) / 10,
    }

    // Total goal distribution
    const goalDistribution: { goals: number; probability: number }[] = []
    for (let g = 0; g <= 7; g++) {
      let prob = 0
      for (let i = 0; i <= MAX_GOALS; i++) {
        for (let j = 0; j <= MAX_GOALS; j++) {
          if (i + j === g) prob += scoreMatrix[i][j]
        }
      }
      goalDistribution.push({ goals: g, probability: Math.round(prob * 1000) / 10 })
    }

    return {
      homeWinProb: Math.round(homeWinProb * 1000) / 10,
      drawProb: Math.round(drawProb * 1000) / 10,
      awayWinProb: Math.round(awayWinProb * 1000) / 10,
      expectedHomeGoals: Math.round(lambda * 100) / 100,
      expectedAwayGoals: Math.round(mu * 100) / 100,
      mostLikelyScore,
      scoreMatrix,
      overProb,
      bttsProb: Math.round(bttsProb * 1000) / 10,
      halfTimeExpected,
      goalDistribution,
    }
  }
}

// Singleton instance
let dixonColesInstance: DixonColesModel | null = null

export function getDixonColesModel(): DixonColesModel {
  if (!dixonColesInstance) {
    dixonColesInstance = new DixonColesModel()
  }
  return dixonColesInstance
}
