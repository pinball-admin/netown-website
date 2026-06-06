import { NextResponse } from 'next/server'
import { createOrUpdateBracket } from '@/libs/bracket'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { picks } = await request.json()
    if (!picks || !Array.isArray(picks)) {
      return NextResponse.json({ success: false, message: 'picks array is required' }, { status: 400 })
    }

    const result = await createOrUpdateBracket(payload.userId, picks)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save bracket' },
      { status: 500 }
    )
  }
}
