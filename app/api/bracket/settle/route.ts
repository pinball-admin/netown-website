import { NextResponse } from 'next/server'
import { settleBracketSlot, settleChampion } from '@/libs/bracket'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Auth: must be admin or master
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || (user.role !== 'admin' && user.role !== 'master')) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
    }

    const { matchSlot, winnerTeamId, winnerTeamName, isChampion } = await request.json()

    if (!matchSlot || !winnerTeamId) {
      return NextResponse.json({ success: false, message: 'matchSlot and winnerTeamId are required' }, { status: 400 })
    }

    let result
    if (isChampion) {
      result = await settleChampion(winnerTeamId)
    } else {
      result = await settleBracketSlot(matchSlot, winnerTeamId, winnerTeamName || winnerTeamId)
    }

    return NextResponse.json({
      success: true,
      settled: result.settled,
      message: `Settled ${result.settled} picks for ${matchSlot}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to settle bracket' },
      { status: 500 }
    )
  }
}
