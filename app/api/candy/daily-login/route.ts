import { NextResponse } from 'next/server'
import { processDailyLogin, getProfile } from '@/libs/candy/ledger'

export async function POST(request: Request) {
  const { userId } = await request.json()
  
  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 })
  }
  
  const result = processDailyLogin(userId)
  const profile = getProfile(userId)
  
  return NextResponse.json({
    success: true,
    streak: result.streak,
    bonus: result.bonus,
    balance: profile?.candyBalance || 0
  })
}
