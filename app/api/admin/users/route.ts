import { NextResponse } from 'next/server'
import { requireAdmin } from '@/libs/auth/admin'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      ...(search.includes('@') ? [] : [{ displayName: { contains: search } }]),
    ]
  }
  if (role) where.role = role

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        region: true,
        candyBalance: true,
        totalPredictions: true,
        correctPredictions: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        preferredLanguage: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ success: true, users, total, page, pageSize })
}
