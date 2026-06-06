import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/libs/candy/ledger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') as 'weekly' | 'monthly' | 'alltime') || 'alltime'
  const limit = parseInt(searchParams.get('limit') || '20')

  const leaderboard = await getLeaderboard(limit, period)

  return NextResponse.json({ success: true, leaderboard, period })
}
