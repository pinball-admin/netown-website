import { NextResponse } from 'next/server'
import { getTodayQuiz } from '@/libs/quiz'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    let userId: string | undefined

    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.userId
      }
    }

    const result = await getTodayQuiz(userId)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Error fetching today quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}
