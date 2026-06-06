import { NextResponse } from 'next/server'
import { requireAdmin } from '@/libs/auth/admin'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [
    userCount,
    predictionCount,
    settledPredictionCount,
    correctPredictionCount,
    postCount,
    transactionCount,
    activeUsers24h,
    adminUsers,
    masterUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userPrediction.count(),
    prisma.userPrediction.count({ where: { isCorrect: { not: null } } }),
    prisma.userPrediction.count({ where: { isCorrect: true } }),
    prisma.post.count(),
    prisma.candyTransaction.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: last24h } } }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { role: 'master' } }),
  ])

  const accuracy = predictionCount > 0
    ? Math.round((correctPredictionCount / predictionCount) * 100)
    : 0

  return NextResponse.json({
    success: true,
    stats: {
      totalUsers: userCount,
      totalPredictions: predictionCount,
      settledPredictions: settledPredictionCount,
      correctPredictions: correctPredictionCount,
      totalPosts: postCount,
      totalTransactions: transactionCount,
      activeUsers24h,
      adminUsers,
      masterUsers,
      accuracy,
    },
  })
}
