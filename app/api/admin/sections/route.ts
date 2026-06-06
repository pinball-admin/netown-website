import { NextResponse } from 'next/server'
import { requireAdmin } from '@/libs/auth/admin'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/admin/sections - List all sections (admin)
export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const status = searchParams.get('status') || '' // pending | approved | rejected | all
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (search) where.name = { contains: search }

    const [sections, total] = await Promise.all([
      prisma.territorySection.findMany({
        where,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          category: true,
          status: true,
          memberCount: true,
          postCount: true,
          creationCost: true,
          createdAt: true,
          rejectReason: true,
          owner: {
            select: { id: true, name: true, displayName: true, email: true },
          },
          approvedBy: {
            select: { id: true, name: true, displayName: true },
          },
          approvedAt: true,
        },
      }),
      prisma.territorySection.count({ where }),
    ])

    return NextResponse.json({ success: true, sections, total, page, pageSize })
  } catch (error) {
    console.error('[Admin Sections] Failed to list:', error)
    return NextResponse.json({ success: false, message: 'Failed to list sections' }, { status: 500 })
  }
}

// PATCH /api/admin/sections - Approve/reject a section
export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, action, rejectReason } = await request.json()

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid request: id and action (approve|reject) required' }, { status: 400 })
    }

    const section = await prisma.territorySection.findUnique({ where: { id } })
    if (!section) {
      return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 })
    }
    if (section.status !== 'pending') {
      return NextResponse.json({ success: false, message: `Section is already ${section.status}` }, { status: 400 })
    }

    const updateData: any = {}
    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.approvedById = auth.user.id
      updateData.approvedAt = new Date()
    } else {
      updateData.status = 'rejected'
      updateData.rejectReason = rejectReason || 'Not approved by admin'
      updateData.approvedById = auth.user.id
      updateData.approvedAt = new Date()
    }

    const updated = await prisma.territorySection.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        rejectReason: true,
        approvedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Section approved' : 'Section rejected',
      section: updated,
    })
  } catch (error) {
    console.error('[Admin Sections] Failed to process:', error)
    return NextResponse.json({ success: false, message: 'Failed to process section' }, { status: 500 })
  }
}
