import { NextResponse } from 'next/server'
import { getFollowing } from '@/libs/follow'
import { prisma } from '@/libs/prisma/client'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

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

    const userId = payload.userId

    // Get current user stats
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        displayName: true,
        candyBalance: true,
        totalPredictions: true,
        correctPredictions: true,
        role: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Get following users' stats
    const following = await getFollowing(userId)

    const currentUserAccuracy = currentUser.totalPredictions > 0
      ? Math.round((currentUser.correctPredictions / currentUser.totalPredictions) * 100)
      : 0

    const me = {
      userId: currentUser.id,
      name: currentUser.displayName || currentUser.name,
      candyBalance: currentUser.candyBalance,
      totalPredictions: currentUser.totalPredictions,
      correctPredictions: currentUser.correctPredictions,
      accuracy: currentUserAccuracy,
      role: currentUser.role,
      isMe: true,
    }

    const friends = following.map(f => ({
      userId: f.id,
      name: f.displayName || f.name,
      candyBalance: f.candyBalance,
      totalPredictions: f.totalPredictions,
      correctPredictions: f.correctPredictions,
      accuracy: f.accuracy,
      role: f.role,
      isMe: false,
    }))

    // Sort combined list by accuracy desc
    const combined = [me, ...friends].sort((a, b) => {
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy
      return b.candyBalance - a.candyBalance
    })

    // Assign rankings
    const ranked = combined.map((entry, index) => ({
      ...entry,
      ranking: index + 1,
    }))

    return NextResponse.json({
      success: true,
      me: ranked.find(e => e.isMe),
      friends: ranked.filter(e => !e.isMe),
      leaderboard: ranked,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to compare' },
      { status: 500 }
    )
  }
}
