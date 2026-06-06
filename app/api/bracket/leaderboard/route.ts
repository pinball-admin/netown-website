import { NextResponse } from 'next/server'
import { getBracketLeaderboard } from '@/libs/bracket'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const leaderboard = await getBracketLeaderboard(limit)

    return NextResponse.json({ success: true, leaderboard })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch bracket leaderboard' },
      { status: 500 }
    )
  }
}
