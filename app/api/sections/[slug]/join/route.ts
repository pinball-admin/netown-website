import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

// POST /api/sections/[slug]/join - Join a section
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
    if (section.status !== 'approved') {
      return NextResponse.json({ success: false, message: 'Section is not yet approved' }, { status: 400 })
    }

    // Check if already a member
    const existing = await prisma.territorySectionMember.findUnique({
      where: { sectionId_userId: { sectionId: section.id, userId: payload.userId } },
    })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Already a member' }, { status: 409 })
    }

    // Add member and increment count
    await prisma.$transaction(async (tx) => {
      await tx.territorySectionMember.create({
        data: { sectionId: section.id, userId: payload.userId },
      })
      await tx.territorySection.update({
        where: { id: section.id },
        data: { memberCount: { increment: 1 } },
      })
    })

    return NextResponse.json({ success: true, message: 'Joined section successfully' })
  } catch (error) {
    console.error('[Sections] Failed to join:', error)
    return NextResponse.json({ success: false, message: 'Failed to join section' }, { status: 500 })
  }
}
