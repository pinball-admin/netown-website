import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/sections/[slug]/posts - List posts in a section
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const section = await prisma.territorySection.findUnique({ where: { slug: params.slug } })
    if (!section) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') || '20'))

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { sectionId: section.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, displayName: true, avatarUrl: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      }),
      prisma.post.count({ where: { sectionId: section.id } }),
    ])

    return NextResponse.json({ success: true, posts, total, page, pageSize })
  } catch (error) {
    console.error('[Sections] Failed to list posts:', error)
    return NextResponse.json({ success: false, message: 'Failed to list posts' }, { status: 500 })
  }
}
