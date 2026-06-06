import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

// POST /api/sections/[slug]/leave - Leave a section
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    const section = await prisma.territorySection.findUnique({ where: { slug: params.slug } })
    if (!section) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }

    // Can't leave if you're the owner
    if (section.ownerId === payload.userId) {
      return NextResponse.json({ success: false, message: 'Owner cannot leave. Transfer ownership first.' }, { status: 400 })
    }

    const membership = await prisma.territorySectionMember.findUnique({
      where: { sectionId_userId: { sectionId: section.id, userId: payload.userId } },
    })
    if (!membership) {
      return NextResponse.json({ success: false, message: 'Not a member' }, { status: 404 })
    }

    // Remove member and decrement count
    await prisma.$transaction(async (tx) => {
      await tx.territorySectionMember.delete({
        where: { sectionId_userId: { sectionId: section.id, userId: payload.userId } },
      })
      await tx.territorySection.update({
        where: { id: section.id },
        data: { memberCount: { decrement: 1 } },
      })
    })

    return NextResponse.json({ success: true, message: 'Left section successfully' })
  } catch (error) {
    console.error('[Sections] Failed to leave:', error)
    return NextResponse.json({ success: false, message: 'Failed to leave section' }, { status: 500 })
  }
}
