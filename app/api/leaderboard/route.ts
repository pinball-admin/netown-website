import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/libs/candy/ledger'

export const dynamic = 'force-dynamic'

export async function GET() {
  const leaderboard = await getLeaderboard()
  
  return NextResponse.json({ success: true, leaderboard })
}
