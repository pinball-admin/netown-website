import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'
import { resolvePostId } from '@/libs/forum/masterPost'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { postId, content, parentId } = await request.json()

    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Post ID and content are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const resolvedPostId = await resolvePostId(postId)
    if (!resolvedPostId) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    // Validate parentId if provided (max depth 2: 0=top, 1=nested)
    let depth = 0
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } })
      if (!parentComment || parentComment.postId !== resolvedPostId) {
        return NextResponse.json(
          { success: false, message: 'Invalid parent comment' },
          { status: 400 }
        )
      }
      depth = Math.min((parentComment.depth || 0) + 1, 1) // max depth = 1
      // If parent is already nested, reply to the same parent
      const actualParentId = depth === 1 && parentComment.depth === 1 ? parentComment.parentId || parentId : parentId

      const comment = await prisma.comment.create({
        data: {
          postId: resolvedPostId,
          userId: user.id,
          content: content.trim(),
          parentId: actualParentId,
          depth,
        },
        include: { user: true },
      })

      return NextResponse.json({
        success: true,
        comment: {
          id: comment.id,
          author: comment.user.name,
          avatar: '⚽',
          country: '🌍',
          content: comment.content,
          time: 'Just now',
          createdAt: comment.createdAt,
          parentId: comment.parentId,
          depth: comment.depth,
        },
      })
    }

    const comment = await prisma.comment.create({
      data: {
        postId: resolvedPostId,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        author: comment.user.name,
        avatar: '⚽',
        country: '🌍',
        content: comment.content,
        time: 'Just now',
        createdAt: comment.createdAt,
      },
    })
  } catch (error) {
    console.error('[COMMENT] Failed to create comment:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      )
    }

    const resolvedPostId = await resolvePostId(postId)
    if (!resolvedPostId) {
      return NextResponse.json({ success: true, comments: [] })
    }

    const comments = await prisma.comment.findMany({
      where: { postId: resolvedPostId },
      include: { user: true, replies: { include: { user: true }, orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    const formattedComments = comments
      .filter((c) => !c.parentId) // Only top-level
      .map((comment) => ({
        id: comment.id,
        author: comment.user.name,
        avatar: '⚽',
        country: '🌍',
        content: comment.content,
        time: formatTime(comment.createdAt),
        createdAt: comment.createdAt,
        depth: comment.depth,
        replies: (comment.replies || []).map((reply) => ({
          id: reply.id,
          author: reply.user.name,
          avatar: '⚽',
          country: '🌍',
          content: reply.content,
          time: formatTime(reply.createdAt),
          createdAt: reply.createdAt,
          parentId: reply.parentId,
          depth: reply.depth,
        })),
      }))

    return NextResponse.json({
      success: true,
      comments: formattedComments,
    })
  } catch (error) {
    console.error('[COMMENT] Failed to fetch comments:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

function formatTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
