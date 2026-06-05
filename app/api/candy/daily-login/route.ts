import { NextResponse } from 'next/server'
import { processDailyLogin, getUserCandyProfile } from '@/libs/candy/ledger'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const result = await processDailyLogin(payload.userId)
    const profile = await getUserCandyProfile(payload.userId)

    return NextResponse.json({
      success: true,
      streak: result.streak,
      bonus: result.bonus,
      balance: profile?.candyBalance || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Daily login failed' },
      { status: 500 }
    )
  }
}
