import { NextResponse } from 'next/server'
import { isFollowing, getFollowCounts } from '@/libs/follow'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')
    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 })
    }

    // Get follower/following counts (public)
    const counts = await getFollowCounts(targetUserId)

    // Check if current user follows target user (requires auth)
    let following = false
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        following = await isFollowing(payload.userId, targetUserId)
      }
    }

    return NextResponse.json({
      success: true,
      following,
      ...counts,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get follow status' },
      { status: 500 }
    )
  }
}
