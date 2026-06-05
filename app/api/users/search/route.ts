import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 1) {
      return NextResponse.json({ success: true, users: [] })
    }

    const users = await prisma.user.findMany({
      where: {
        name: { contains: q },
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        totalPredictions: true,
        correctPredictions: true,
      },
      take: 10,
      orderBy: { totalPredictions: 'desc' },
    })

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        accuracy: u.totalPredictions > 0 ? Math.round((u.correctPredictions / u.totalPredictions) * 100) : 0,
      })),
    })
  } catch (error) {
    console.error('[USER SEARCH] Failed:', error)
    return NextResponse.json({ success: false, message: 'Search failed' }, { status: 500 })
  }
}
