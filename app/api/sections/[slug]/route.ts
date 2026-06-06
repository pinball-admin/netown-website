import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/sections/[slug] - Section detail
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const section = await prisma.territorySection.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        icon: true,
        category: true,
        rules: true,
        status: true,
        memberCount: true,
        postCount: true,
        creationCost: true,
        createdAt: true,
        owner: {
          select: { id: true, name: true, displayName: true },
        },
        _count: {
          select: { members: true, posts: true },
        },
      },
    })

    if (!section) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, section })
  } catch (error) {
    console.error('[Sections] Failed to get detail:', error)
    return NextResponse.json({ success: false, message: 'Failed to get section' }, { status: 500 })
  }
}
