import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { achievements: true },
    })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Calculate global rank
    const rank = await prisma.user.count({
      where: {
        candyBalance: { gt: user.candyBalance },
      },
    })

    // Recent accuracy history (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentPreds = await prisma.userPrediction.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo },
        isCorrect: { not: null },
      },
      orderBy: { createdAt: 'asc' },
      select: { isCorrect: true, createdAt: true },
    })

    const dailyMap = new Map<string, { correct: number; total: number }>()
    for (const p of recentPreds) {
      const dateKey = p.createdAt.toISOString().slice(0, 10)
      const entry = dailyMap.get(dateKey) || { correct: 0, total: 0 }
      entry.total++
      if (p.isCorrect) entry.correct++
      dailyMap.set(dateKey, entry)
    }

    const accuracyHistory = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      accuracy: Math.round((data.correct / data.total) * 100),
    }))

    const accuracy = user.totalPredictions > 0
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalPredictions: user.totalPredictions,
        correctPredictions: user.correctPredictions,
        accuracy,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        candyBalance: user.candyBalance,
        rank: rank + 1,
        accuracyHistory,
        achievements: user.achievements.map((a) => a.type),
      },
    })
  } catch (error) {
    console.error('[USER STATS] Failed:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 })
  }
}
