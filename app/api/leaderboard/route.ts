import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/libs/candy/ledger'

export async function GET() {
  const leaderboard = getLeaderboard()
  
  return NextResponse.json({ success: true, leaderboard })
}
