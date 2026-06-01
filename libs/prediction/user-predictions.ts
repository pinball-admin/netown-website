export type PredictionType = 'match_result' | 'score' | 'over_under' | 'total_goals'

export type MatchResult = 'win' | 'draw' | 'loss'

export interface UserPrediction {
  id: string
  userId: string
  matchId: string
  type: PredictionType
  prediction: string
  difficulty: 'easy' | 'medium' | 'hard'
  isCorrect?: boolean
  pointsAwarded?: number
  createdAt: Date
  matchStartTime: Date
}

export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  startTime: Date
  status: 'upcoming' | 'in_progress' | 'completed'
}

let predictions: UserPrediction[] = []
let matches: Match[] = []

export function createPrediction(
  userId: string,
  matchId: string,
  type: PredictionType,
  prediction: string
): UserPrediction {
  const match = matches.find(m => m.id === matchId)
  if (!match || match.status !== 'upcoming') {
    throw new Error('Match is not available for prediction')
  }
  
  const difficulties: Record<string, 'easy' | 'medium' | 'hard'> = {
    match_result: 'easy',
    score: 'hard',
    over_under: 'medium',
    total_goals: 'hard'
  }
  
  const newPrediction: UserPrediction = {
    id: `pred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    matchId,
    type,
    prediction,
    difficulty: difficulties[type],
    createdAt: new Date(),
    matchStartTime: match.startTime
  }
  
  predictions.push(newPrediction)
  
  return newPrediction
}

export function getPredictionsByUser(userId: string): UserPrediction[] {
  return predictions.filter(p => p.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getPredictionsByMatch(matchId: string): UserPrediction[] {
  return predictions.filter(p => p.matchId === matchId)
}

export function getMatchById(matchId: string): Match | undefined {
  return matches.find(m => m.id === matchId)
}

export function getUpcomingMatches(): Match[] {
  return matches.filter(m => m.status === 'upcoming').sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

export function getCompletedMatches(): Match[] {
  return matches.filter(m => m.status === 'completed')
}

export function simulateMatchResult(matchId: string, homeScore: number, awayScore: number) {
  const match = matches.find(m => m.id === matchId)
  if (!match) return
  
  match.homeScore = homeScore
  match.awayScore = awayScore
  match.status = 'completed'
  
  const matchPredictions = predictions.filter(p => p.matchId === matchId && p.isCorrect === undefined)
  
  matchPredictions.forEach(prediction => {
    let isCorrect = false
    
    switch (prediction.type) {
      case 'match_result':
        const expectedResult = prediction.prediction
        const actualResult = homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'draw'
        isCorrect = expectedResult === actualResult
        break
        
      case 'score':
        isCorrect = prediction.prediction === `${homeScore}-${awayScore}`
        break
        
      case 'over_under':
        const total = homeScore + awayScore
        const [, threshold] = prediction.prediction.split('_')
        const isOver = total > parseFloat(threshold)
        isCorrect = (prediction.prediction.startsWith('over') && isOver) || 
                   (prediction.prediction.startsWith('under') && !isOver)
        break
        
      case 'total_goals':
        const totalGoals = homeScore + awayScore
        isCorrect = prediction.prediction === totalGoals.toString()
        break
    }
    
    prediction.isCorrect = isCorrect
  })
}

export function initMockMatches() {
  const teamNames = ['Argentina', 'Brazil', 'France', 'Germany', 'Spain', 'England', 'Italy', 'Netherlands']
  
  const mockMatches: Match[] = []
  
  for (let i = 0; i < 10; i++) {
    const homeTeam = teamNames[Math.floor(Math.random() * teamNames.length)]
    let awayTeam = teamNames[Math.floor(Math.random() * teamNames.length)]
    while (awayTeam === homeTeam) {
      awayTeam = teamNames[Math.floor(Math.random() * teamNames.length)]
    }
    
    const isCompleted = Math.random() > 0.6
    const startTime = isCompleted 
      ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    mockMatches.push({
      id: `match-${i + 1}`,
      homeTeam,
      awayTeam,
      homeScore: isCompleted ? Math.floor(Math.random() * 5) : undefined,
      awayScore: isCompleted ? Math.floor(Math.random() * 5) : undefined,
      startTime,
      status: isCompleted ? 'completed' : 'upcoming'
    })
  }
  
  matches = mockMatches
}

export function getPredictionStats(userId: string): { total: number; correct: number; accuracy: number } {
  const userPredictions = predictions.filter(p => p.userId === userId)
  const completed = userPredictions.filter(p => p.isCorrect !== undefined)
  const correct = completed.filter(p => p.isCorrect).length
  
  return {
    total: userPredictions.length,
    correct,
    accuracy: completed.length > 0 ? Math.round((correct / completed.length) * 100) : 0
  }
}
