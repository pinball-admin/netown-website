import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      author: post.user.name,
      avatar: '⚽',
      country: '🌍',
      content: post.content,
      imageUrl: post.imageUrl,
      likes: post.likes,
      comments: post.comments,
      createdAt: post.createdAt,
    }))

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
    })
  } catch (error) {
    console.error('[POSTS] Failed to fetch posts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
