import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'
import { translatePost } from '@/libs/services/translate'
import { SUPPORTED_LANGUAGES } from '@/libs/services/translate'

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

    const { content, imageUrl } = await request.json()

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

    // Auto-translate content to all supported languages
    let translations: Record<string, string> = {}
    let sourceLanguage = 'en'
    try {
      const result = await translatePost(content.trim())
      translations = result.translations
      sourceLanguage = result.detectedLanguage
      console.log(`[POSTS] Auto-translated post from ${sourceLanguage} to ${Object.keys(translations).length} languages`)
    } catch (translationError) {
      console.warn('[POSTS] Translation failed, storing original only:', translationError)
      // Store original content for all languages
      translations = Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l, content.trim()]))
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        sourceLanguage,
        translations: JSON.stringify(translations),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        author: (post as any).user?.name || 'Unknown',
        avatar: '⚽',
        country: '🌍',
        content: post.content,
        sourceLanguage: post.sourceLanguage,
        translations: post.translations,
        imageUrl: post.imageUrl,
        likes: post.likes,
        comments: (post as any).comments?.length || 0,
        time: 'Just now',
        createdAt: post.createdAt,
      },
    })
  } catch (error) {
    console.error('[POSTS] Failed to create post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    )
  }
}
