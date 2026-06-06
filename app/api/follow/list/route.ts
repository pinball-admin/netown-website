import { NextResponse } from 'next/server'
import { getFollowing, getFollowers } from '@/libs/follow'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'following' // 'following' | 'followers'
    const userId = searchParams.get('userId')

    let targetUserId = userId

    // If no userId specified, use the authenticated user
    if (!targetUserId) {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth_token')?.value
      if (!token) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
      }
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
      }
      targetUserId = payload.userId
    }

    const limit = parseInt(searchParams.get('limit') || '50')

    let users
    if (type === 'followers') {
      users = await getFollowers(targetUserId, limit)
    } else {
      users = await getFollowing(targetUserId, limit)
    }

    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch follow list' },
      { status: 500 }
    )
  }
}
