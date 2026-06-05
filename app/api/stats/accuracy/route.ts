import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Get last 30 days of predictions grouped by day
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const predictions = await prisma.userPrediction.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo },
        isCorrect: { not: null },
      },
      orderBy: { createdAt: 'asc' },
      select: { isCorrect: true, createdAt: true },
    })

    // Group by date and calculate daily accuracy
    const dailyMap = new Map<string, { correct: number; total: number }>()
    for (const p of predictions) {
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

    return NextResponse.json({ success: true, accuracyHistory })
  } catch (error) {
    console.error('[ACCURACY STATS] Failed:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 })
  }
}
