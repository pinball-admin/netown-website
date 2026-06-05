// Candy Ledger - Prisma/PostgreSQL backed
// All candy operations are persisted to the database

import { prisma } from '@/libs/prisma/client'

export type TransactionType =
  | 'SIGNUP'
  | 'DAILY_LOGIN'
  | 'COMMUNITY_POST'
  | 'PREDICTION_CORRECT'
  | 'PREDICTION_BONUS'
  | 'CONVERSION'
  | 'ADMIN_ADJUSTMENT'

export interface CandyTransactionResult {
  id: string
  userId: string
  amount: number
  type: string
  description: string | null
  referenceId: string | null
  createdAt: Date
}

/**
 * Create a candy transaction and update user balance atomically
 */
export async function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  description?: string,
  referenceId?: string
): Promise<CandyTransactionResult> {
  // Use a transaction to ensure atomicity
  const [tx] = await prisma.$transaction([
    prisma.candyTransaction.create({
      data: {
        userId,
        type,
        amount,
        description: description || null,
        referenceId: referenceId || null,
      },
    }),
  ])

  // Update user candy balance
  await prisma.user.update({
    where: { id: userId },
    data: { candyBalance: { increment: amount } },
  })

  return {
    id: tx.id,
    userId: tx.userId,
    amount: tx.amount,
    type: tx.type,
    description: tx.description,
    referenceId: tx.referenceId,
    createdAt: tx.createdAt,
  }
}

/**
 * Get transaction history for a user
 */
export async function getTransactions(
  userId: string,
  limit: number = 50
): Promise<CandyTransactionResult[]> {
  const transactions = await prisma.candyTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return transactions.map(tx => ({
    id: tx.id,
    userId: tx.userId,
    amount: tx.amount,
    type: tx.type,
    description: tx.description,
    referenceId: tx.referenceId,
    createdAt: tx.createdAt,
  }))
}

/**
 * Process daily login: award streak-based candy bonus
 */
export async function processDailyLogin(
  userId: string
): Promise<{ streak: number; bonus: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Already checked in today
  if (user.lastLoginDate === today) {
    return { streak: user.currentStreak, bonus: 0 }
  }

  let newStreak = 1
  let bonus = 10

  if (user.lastLoginDate === yesterday) {
    // Consecutive day
    newStreak = user.currentStreak + 1
    bonus = 10 * Math.min(newStreak, 7) // Max 70 per day for 7-day streak
  }
  // else: streak broken, reset to 1

  // Update user streak and last login date
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastLoginDate: today,
    },
  })

  // Award candy bonus
  if (bonus > 0) {
    await createTransaction(
      userId,
      'DAILY_LOGIN',
      bonus,
      `Daily login streak x${newStreak}`
    )
  }

  return { streak: newStreak, bonus }
}

/**
 * Award candy for community actions (post, comment, like)
 */
export async function awardCommunityBoost(
  userId: string,
  action: 'post' | 'comment' | 'like'
): Promise<number> {
  const rewards: Record<string, number> = {
    post: 20,
    comment: 5,
    like: 1,
  }

  const reward = rewards[action] || 0
  if (reward > 0) {
    await createTransaction(
      userId,
      'COMMUNITY_POST',
      reward,
      `Community boost: ${action}`
    )
  }

  return reward
}

/**
 * Record a prediction result and award candy if correct
 */
export async function recordPredictionResult(
  userId: string,
  isCorrect: boolean,
  difficulty: 'easy' | 'medium' | 'hard',
  predictionId?: string
): Promise<number> {
  if (!isCorrect) return 0

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return 0

  const baseRewards: Record<string, number> = {
    easy: 25,
    medium: 50,
    hard: 100,
  }

  const newTotal = user.totalPredictions + 1
  const newCorrect = user.correctPredictions + 1
  const accuracyBonus = Math.floor((newCorrect / newTotal) * 10)
  const reward = baseRewards[difficulty] + accuracyBonus

  // Update prediction stats on user
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalPredictions: newTotal,
      correctPredictions: newCorrect,
    },
  })

  await createTransaction(
    userId,
    'PREDICTION_CORRECT',
    reward,
    `Prediction correct (${difficulty})`,
    predictionId
  )

  // Check master promotion
  await checkMasterPromotion(userId)

  return reward
}

/**
 * Increment prediction count (for incorrect predictions)
 */
export async function recordPredictionAttempt(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { totalPredictions: { increment: 1 } },
  })
}

/**
 * Check if user qualifies for Master Predictor promotion
 * Requires: >= 20 predictions and >= 75% accuracy
 */
export async function checkMasterPromotion(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role === 'master') return false

  if (user.totalPredictions >= 20) {
    const accuracy = user.correctPredictions / user.totalPredictions
    if (accuracy >= 0.75) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'master' },
      })

      await createTransaction(
        userId,
        'ADMIN_ADJUSTMENT',
        1000,
        'Promoted to Master Predictor!'
      )

      return true
    }
  }

  return false
}

/**
 * Get leaderboard: top users by prediction accuracy (min 5 predictions)
 */
export async function getLeaderboard(limit: number = 20) {
  const users = await prisma.user.findMany({
    where: { totalPredictions: { gte: 5 } },
    orderBy: [
      { correctPredictions: 'desc' },
      { candyBalance: 'desc' },
    ],
    take: limit,
  })

  return users.map((user, index) => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    candyBalance: user.candyBalance,
    totalPredictions: user.totalPredictions,
    correctPredictions: user.correctPredictions,
    accuracy:
      user.totalPredictions > 0
        ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
        : 0,
    role: user.role,
    ranking: index + 1,
  }))
}

/**
 * Convert candy to tokens (Web3, master-only, compliant regions only)
 */
export async function convertToTokens(
  userId: string,
  amount: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false
  if (user.candyBalance < amount) return false
  if (user.role !== 'master') return false
  if (user.region === 'CN') return false

  await createTransaction(
    userId,
    'CONVERSION',
    -amount,
    `Converted ${amount} candy to tokens`
  )

  return true
}

/**
 * Get user's candy profile
 */
export async function getUserCandyProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    candyBalance: user.candyBalance,
    totalPredictions: user.totalPredictions,
    correctPredictions: user.correctPredictions,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastLoginDate: user.lastLoginDate,
    role: user.role,
    region: user.region,
  }
}
