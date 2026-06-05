import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

// Pure football images only!
const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1489944440615?w=800',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
  'https://images.unsplash.com/photo-1431324155629?w=800',
  'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=800',
]

const getRandomImage = () => {
  return FOOTBALL_IMAGES[Math.floor(Math.random() * FOOTBALL_IMAGES.length)]
}

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

    const { title, content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
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

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: getRandomImage(),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: title || 'Football Discussion',
        author: post.user.name,
        avatar: '⚽',
        country: '🌍',
        content: post.content,
        imageUrl: post.imageUrl,
        likes: 0,
        comments: 0,
        time: 'Just now',
        createdAt: post.createdAt,
      },
    })
  } catch (error) {
    console.error('[FORUM] Failed to create post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    )
  }
}
