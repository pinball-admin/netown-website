import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'
import { resolvePostId } from '@/libs/forum/masterPost'

export const dynamic = 'force-dynamic'

// POST /api/forum/reaction - Toggle a reaction on a post
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

    const { postId, type } = await request.json()
    if (!postId || !type || !['like', 'fire', 'laugh', 'sad'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Valid postId and type required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const resolvedPostId = await resolvePostId(postId)
    if (!resolvedPostId) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    // Toggle: if exists, delete; otherwise create
    const existing = await prisma.postReaction.findUnique({
      where: { postId_userId_type: { postId: resolvedPostId, userId: user.id, type } },
    })

    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } })
      return NextResponse.json({ success: true, action: 'removed', type })
    } else {
      const reaction = await prisma.postReaction.create({
        data: { postId: resolvedPostId, userId: user.id, type },
      })
      return NextResponse.json({ success: true, action: 'added', type })
    }
  } catch (error) {
    console.error('[REACTION] Failed:', error)
    return NextResponse.json({ success: false, message: 'Failed to toggle reaction' }, { status: 500 })
  }
}

// GET /api/forum/reaction?postId=xxx - Get reaction counts for a post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ success: false, message: 'postId required' }, { status: 400 })
    }

    const resolvedPostId = await resolvePostId(postId)
    if (!resolvedPostId) {
      return NextResponse.json({ success: true, reactions: {} })
    }

    const reactions = await prisma.postReaction.groupBy({
      by: ['type'],
      where: { postId: resolvedPostId },
      _count: { type: true },
    })

    const result: Record<string, number> = {}
    for (const r of reactions) {
      result[r.type] = r._count.type
    }

    return NextResponse.json({ success: true, reactions: result })
  } catch (error) {
    console.error('[REACTION] Failed to fetch:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch reactions' }, { status: 500 })
  }
}
