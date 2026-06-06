import { NextResponse } from 'next/server'
import { followUser, unfollowUser } from '@/libs/follow'
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

    const { followingId } = await request.json()
    if (!followingId) {
      return NextResponse.json({ success: false, message: 'followingId is required' }, { status: 400 })
    }

    const result = await followUser(payload.userId, followingId)
    return NextResponse.json({ success: true, follow: result })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to follow user' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const followingId = searchParams.get('followingId')
    if (!followingId) {
      return NextResponse.json({ success: false, message: 'followingId is required' }, { status: 400 })
    }

    await unfollowUser(payload.userId, followingId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to unfollow user' },
      { status: 400 }
    )
  }
}
