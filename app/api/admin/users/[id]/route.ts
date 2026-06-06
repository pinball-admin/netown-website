import { NextResponse } from 'next/server'
import { requireAdmin } from '@/libs/auth/admin'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      region: true,
      preferredLanguage: true,
      candyBalance: true,
      totalPredictions: true,
      correctPredictions: true,
      currentStreak: true,
      longestStreak: true,
      lastLoginDate: true,
      lastLoginAt: true,
      isVerified: true,
      predictionUnlockUntil: true,
      referralCode: true,
      createdAt: true,
      _count: {
        select: {
          predictions: true,
          posts: true,
          comments: true,
          candyTransactions: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, user })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { role, displayName, name, region, candyBalance } = body

  const allowedRoles = ['user', 'master', 'admin']
  if (role && !allowedRoles.includes(role)) {
    return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
  }

  const updateData: any = {}
  if (role) updateData.role = role
  if (displayName !== undefined) updateData.displayName = displayName
  if (name !== undefined) updateData.name = name
  if (region !== undefined) updateData.region = region
  if (candyBalance !== undefined) updateData.candyBalance = candyBalance

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      role: true,
      region: true,
      candyBalance: true,
    },
  })

  return NextResponse.json({ success: true, user })
}
