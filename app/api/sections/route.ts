import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'
import { createTransaction } from '@/libs/candy/ledger'

export const dynamic = 'force-dynamic'

// GET /api/sections - List approved sections
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const where: any = { status: 'approved' }
    if (category) where.category = category
    if (search) where.name = { contains: search }

    const [sections, total] = await Promise.all([
      prisma.territorySection.findMany({
        where,
        orderBy: [{ memberCount: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          icon: true,
          category: true,
          memberCount: true,
          postCount: true,
          createdAt: true,
          owner: {
            select: { id: true, name: true, displayName: true },
          },
        },
      }),
      prisma.territorySection.count({ where }),
    ])

    return NextResponse.json({ success: true, sections, total, page, pageSize })
  } catch (error) {
    console.error('[Sections] Failed to list:', error)
    return NextResponse.json({ success: false, message: 'Failed to list sections' }, { status: 500 })
  }
}

// POST /api/sections - Create a new section (costs candy, needs admin approval)
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

    const { name, slug, description, icon, category, rules } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ success: false, message: 'Name and slug are required' }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ success: false, message: 'Slug must be lowercase alphanumeric with hyphens' }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await prisma.territorySection.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'This slug is already taken' }, { status: 409 })
    }

    // Check candy balance
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const cost = 100
    if (user.candyBalance < cost) {
      return NextResponse.json({
        success: false,
        message: `Insufficient candy. You need ${cost} candy to create a section. Your balance: ${user.candyBalance}`,
      }, { status: 400 })
    }

    // Create section and deduct candy in transaction
    const section = await prisma.$transaction(async (tx) => {
      // Create the section
      const s = await tx.territorySection.create({
        data: {
          name,
          slug,
          description: description || null,
          icon: icon || '📁',
          category: category || null,
          rules: rules || null,
          status: 'pending',
          ownerId: payload.userId,
          creationCost: cost,
          memberCount: 1,
        },
      })

      // Add creator as member
      await tx.territorySectionMember.create({
        data: {
          sectionId: s.id,
          userId: payload.userId,
          role: 'moderator',
        },
      })

      return s
    })

    // Deduct candy (outside transaction to leverage the ledger function)
    await createTransaction(payload.userId, 'TERRITORY_CREATE', -cost, `Created section: ${name}`, section.id)

    return NextResponse.json({
      success: true,
      message: 'Section created successfully. Awaiting admin approval.',
      section: {
        id: section.id,
        name: section.name,
        slug: section.slug,
        status: section.status,
      },
    })
  } catch (error) {
    console.error('[Sections] Failed to create:', error)
    return NextResponse.json({ success: false, message: 'Failed to create section' }, { status: 500 })
  }
}
