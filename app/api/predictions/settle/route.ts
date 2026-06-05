import { NextResponse } from 'next/server'
import { settleMatch } from '@/libs/prediction/user-predictions'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * POST /api/predictions/settle
 * Settle all predictions for a match after it ends
 * Body: { matchId: string, homeScore: number, awayScore: number }
 * 
 * In production, this would be called by a cron job or admin panel
 */
export async function POST(request: Request) {
  try {
    // Verify admin or system access
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    // Allow system calls with API key (for cron jobs)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.ADMIN_API_KEY

    if (token) {
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
      }
      // Only admin or master users can settle matches
      // For now, allow any authenticated user (in production, restrict to admin)
    } else if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 })
    }

    const { matchId, homeScore, awayScore } = await request.json()

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: matchId, homeScore, awayScore' },
        { status: 400 }
      )
    }

    const result = await settleMatch(matchId, Number(homeScore), Number(awayScore))

    return NextResponse.json({
      success: true,
      message: `Match settled: ${result.settled} predictions evaluated, ${result.correct} correct`,
      ...result,
    })
  } catch (error) {
    console.error('[PREDICTIONS] Settlement failed:', error)
    return NextResponse.json(
      { success: false, message: 'Settlement failed' },
      { status: 500 }
    )
  }
}
