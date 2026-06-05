import { NextResponse } from 'next/server'
import { getPredictionsByUser, getPredictionStats } from '@/libs/prediction/user-predictions'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    // Use the authenticated user's ID (ignore query param for security)
    const userId = payload.userId
    const predictions = await getPredictionsByUser(userId)
    const stats = await getPredictionStats(userId)

    return NextResponse.json({ success: true, predictions, stats })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}
