import { NextResponse } from 'next/server'
import { createPrediction } from '@/libs/prediction/user-predictions'
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

    const { matchId, type, prediction } = await request.json()

    if (!matchId || !type || !prediction) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: matchId, type, prediction' },
        { status: 400 }
      )
    }

    const validTypes = ['MATCH_RESULT', 'SCORE', 'OVER_UNDER', 'TOTAL_GOALS']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: `Invalid prediction type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await createPrediction(payload.userId, matchId, type as any, prediction)
    return NextResponse.json({ success: true, prediction: result })
  } catch (error) {
    const message = (error as Error).message || 'Failed to create prediction'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
