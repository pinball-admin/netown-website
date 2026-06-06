import { NextRequest, NextResponse } from 'next/server'
import { checkAnswer } from '@/libs/quiz'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quizId, selectedOption } = body

    if (!quizId || typeof selectedOption !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const result = await checkAnswer(payload.userId, quizId, selectedOption)

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('Error answering quiz:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to answer quiz' },
      { status: 500 }
    )
  }
}
