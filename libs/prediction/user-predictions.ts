// User Predictions - Prisma/PostgreSQL backed
// All prediction operations are persisted to the database

import { prisma } from '@/libs/prisma/client'
import { recordPredictionResult, recordPredictionAttempt } from '@/libs/candy/ledger'

export type PredictionType = 'MATCH_RESULT' | 'SCORE' | 'OVER_UNDER' | 'TOTAL_GOALS'

export interface UserPredictionResult {
  id: string
  userId: string
  matchId: string
  predictionType: string
  prediction: string
  difficulty: string
  isCorrect: boolean | null
  pointsAwarded: number
  settledAt: Date | null
  createdAt: Date
}

const DIFFICULTY_MAP: Record<string, 'easy' | 'medium' | 'hard'> = {
  MATCH_RESULT: 'easy',
  SCORE: 'hard',
  OVER_UNDER: 'medium',
  TOTAL_GOALS: 'hard',
}

/**
 * Create a new prediction for a user on a specific match
 */
export async function createPrediction(
  userId: string,
  matchId: string,
  type: PredictionType,
  prediction: string
): Promise<UserPredictionResult> {
  // Check if user already predicted this match+type
  const existing = await prisma.userPrediction.findFirst({
    where: {
      userId,
      matchId,
      predictionType: type,
    },
  })

  if (existing) {
    throw new Error('You have already made this prediction for this match')
  }

  const newPrediction = await prisma.userPrediction.create({
    data: {
      userId,
      matchId,
      predictionType: type,
      prediction,
      difficulty: DIFFICULTY_MAP[type] || 'easy',
      isCorrect: null,
      pointsAwarded: 0,
    },
  })

  return mapPrediction(newPrediction)
}

/**
 * Get all predictions for a user
 */
export async function getPredictionsByUser(
  userId: string,
  limit: number = 50
): Promise<UserPredictionResult[]> {
  const predictions = await prisma.userPrediction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return predictions.map(mapPrediction)
}

/**
 * Get predictions for a specific match
 */
export async function getPredictionsByMatch(
  matchId: string
): Promise<UserPredictionResult[]> {
  const predictions = await prisma.userPrediction.findMany({
    where: { matchId },
    orderBy: { createdAt: 'desc' },
  })

  return predictions.map(mapPrediction)
}

/**
 * Get a user's prediction for a specific match
 */
export async function getUserPredictionForMatch(
  userId: string,
  matchId: string
): Promise<UserPredictionResult[]> {
  const predictions = await prisma.userPrediction.findMany({
    where: { userId, matchId },
    orderBy: { createdAt: 'desc' },
  })

  return predictions.map(mapPrediction)
}

/**
 * Settle a match: evaluate all unsettled predictions against the actual score
 */
export async function settleMatch(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<{ settled: number; correct: number }> {
  // Get all unsettled predictions for this match
  const predictions = await prisma.userPrediction.findMany({
    where: {
      matchId,
      isCorrect: null,
    },
  })

  let settled = 0
  let correct = 0

  for (const pred of predictions) {
    let isCorrect = false

    switch (pred.predictionType as PredictionType) {
      case 'MATCH_RESULT': {
        const actualResult =
          homeScore > awayScore ? 'home_win' : homeScore < awayScore ? 'away_win' : 'draw'
        isCorrect = pred.prediction === actualResult
        break
      }
      case 'SCORE': {
        isCorrect = pred.prediction === `${homeScore}-${awayScore}`
        break
      }
      case 'OVER_UNDER': {
        const total = homeScore + awayScore
        const threshold = parseFloat(pred.prediction.split('_')[1] || '2.5')
        const isOver = total > threshold
        isCorrect =
          (pred.prediction.startsWith('over') && isOver) ||
          (pred.prediction.startsWith('under') && !isOver)
        break
      }
      case 'TOTAL_GOALS': {
        const totalGoals = homeScore + awayScore
        isCorrect = pred.prediction === totalGoals.toString()
        break
      }
    }

    // Update prediction
    await prisma.userPrediction.update({
      where: { id: pred.id },
      data: {
        isCorrect,
        settledAt: new Date(),
      },
    })

    // Award candy if correct
    if (isCorrect) {
      const difficulty = pred.difficulty as 'easy' | 'medium' | 'hard'
      await recordPredictionResult(pred.userId, true, difficulty, pred.id)
      correct++
    } else {
      await recordPredictionAttempt(pred.userId)
    }

    settled++
  }

  return { settled, correct }
}

/**
 * Get prediction stats for a user
 */
export async function getPredictionStats(userId: string) {
  const predictions = await prisma.userPrediction.findMany({
    where: { userId },
  })

  const completed = predictions.filter(p => p.isCorrect !== null)
  const correct = completed.filter(p => p.isCorrect === true).length

  return {
    total: predictions.length,
    settled: completed.length,
    correct,
    pending: predictions.length - completed.length,
    accuracy:
      completed.length > 0
        ? Math.round((correct / completed.length) * 100)
        : 0,
  }
}

/**
 * Get recent predictions across all users (for activity feed)
 */
export async function getRecentPredictions(limit: number = 20) {
  const predictions = await prisma.userPrediction.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { name: true, role: true },
      },
    },
  })

  return predictions.map(p => ({
    id: p.id,
    userId: p.userId,
    userName: p.user.name,
    userRole: p.user.role,
    matchId: p.matchId,
    predictionType: p.predictionType,
    prediction: p.prediction,
    isCorrect: p.isCorrect,
    createdAt: p.createdAt,
  }))
}

// Helper to map Prisma result to our interface
function mapPrediction(p: any): UserPredictionResult {
  return {
    id: p.id,
    userId: p.userId,
    matchId: p.matchId,
    predictionType: p.predictionType,
    prediction: p.prediction,
    difficulty: p.difficulty,
    isCorrect: p.isCorrect,
    pointsAwarded: p.pointsAwarded,
    settledAt: p.settledAt,
    createdAt: p.createdAt,
  }
}
