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
  const matchId = searchParams.get('matchId') || ''

  const where: any = {}
  if (matchId) where.matchId = matchId

  const [predictions, total] = await Promise.all([
    prisma.userPrediction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.userPrediction.count({ where }),
  ])

  // Group by matchId for aggregate stats
  const matchStats = await prisma.userPrediction.groupBy({
    by: ['matchId'],
    _count: { id: true },
    _sum: { pointsAwarded: true },
  })

  return NextResponse.json({ success: true, predictions, total, page, pageSize, matchStats })
}
