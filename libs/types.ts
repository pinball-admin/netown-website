export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string
  time: string
  venue: string
  group: string
  status: 'scheduled' | 'live' | 'finished'
  score?: {
    home: number
    away: number
  }
  round: string
}

export interface Team {
  id: string
  name: string
  shortName: string
  flag: string
  group: string
}

export interface TeamStats {
  id: string
  name: string
  shortName: string
  flag: string
  founded: number
  stadium: string
  capacity: number
  manager: string
  ranking: number
  group: string
  players: Player[]
  league?: string
  country?: string
  stats?: {
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
  }
}

export interface Player {
  id: string
  name: string
  number: number
  position: string
  age: number
  club: string
  photo?: string
}

export interface Prediction {
  expertId: string
  matchId: string
  predictedWinner: 'home' | 'draw' | 'away'
  predictedScore: { home: number; away: number }
  predictedHalfTime?: { home: number; away: number }
  predictedOverUnder: 'over' | 'under'
  overUnderLine: number
  confidence: number
  reasoning: string
  homeWinProb?: number
  drawProb?: number
  awayWinProb?: number
  bothTeamsScoreProb?: number
  goalDistribution?: { goals: number; probability: number }[]
}

export interface ExpertStats {
  expertId: string
  totalMatches: number
  correctResults: number
  correctScores: number
  correctOverUnder: number
  totalPoints: number
  winRate: number
  accuracy: number
  recentCorrect: number
  recentTotal: number
  streak: number
  rank: number
  isChampion: boolean
  medals: string[]
  lastUpdated: string
}

export type OutcomeType = 'home_win' | 'draw' | 'away_win' | 'over' | 'under'

export interface ExpertPreference {
  outcomeBias: OutcomeType
  riskTolerance: number
  optimismFactor: number
  conservativeHomeBias: number
}

export const EXPERT_IDS = [
  'beckham_chen',
  'zidane_gao',
  'batistuta_zhang',
  'shearer_zhang',
  'ronaldo_silva'
] as const

export type ExpertId = typeof EXPERT_IDS[number]

export const OUTCOMES: OutcomeType[] = ['home_win', 'draw', 'away_win', 'over', 'under']

export const OUTCOME_LABELS: Record<OutcomeType, string> = {
  home_win: '主胜',
  draw: '平局',
  away_win: '客胜',
  over: '大球',
  under: '小球'
}