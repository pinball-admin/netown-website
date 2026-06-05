import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

const UPGRADE_REQUIREMENTS = {
  minPredictions: 20,
  minAccuracy: 75,
  minCandyBalance: 500,
}

function getUpgradeProgress(user: {
  totalPredictions: number
  correctPredictions: number
  candyBalance: number
  role: string
}) {
  const accuracy =
    user.totalPredictions > 0
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
      : 0

  const predictionProgress = Math.min(
    100,
    Math.round((user.totalPredictions / UPGRADE_REQUIREMENTS.minPredictions) * 100)
  )
  const accuracyProgress = Math.min(
    100,
    Math.round((accuracy / UPGRADE_REQUIREMENTS.minAccuracy) * 100)
  )
  const candyProgress = Math.min(
    100,
    Math.round((user.candyBalance / UPGRADE_REQUIREMENTS.minCandyBalance) * 100)
  )

  const overallProgress = Math.round(
    (predictionProgress + accuracyProgress + candyProgress) / 3
  )

  const canUpgrade =
    user.role === 'user' &&
    user.totalPredictions >= UPGRADE_REQUIREMENTS.minPredictions &&
    accuracy >= UPGRADE_REQUIREMENTS.minAccuracy &&
    user.candyBalance >= UPGRADE_REQUIREMENTS.minCandyBalance

  return { accuracy, predictionProgress, accuracyProgress, candyProgress, overallProgress, canUpgrade }
}

export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const progress = getUpgradeProgress(user)

    return NextResponse.json({
      success: true,
      role: user.role,
      requirements: UPGRADE_REQUIREMENTS,
      progress,
    })
  } catch (error) {
    console.error('[USER] Failed to fetch upgrade status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch upgrade status' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const { accuracy, canUpgrade } = getUpgradeProgress(user)

    if (!canUpgrade) {
      return NextResponse.json({
        success: false,
        message: 'Requirements not met',
        requirements: {
          predictions: { current: user.totalPredictions, required: UPGRADE_REQUIREMENTS.minPredictions },
          accuracy: { current: accuracy, required: UPGRADE_REQUIREMENTS.minAccuracy },
          candy: { current: user.candyBalance, required: UPGRADE_REQUIREMENTS.minCandyBalance },
        },
      }, { status: 400 })
    }

    const upgradedUser = await prisma.user.update({
      where: { email: payload.email },
      data: {
        role: 'master',
        predictionUnlockUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Award bonus candy via ledger
    const { createTransaction } = await import('@/libs/candy/ledger')
    await createTransaction(user.id, 'ADMIN_ADJUSTMENT', 1000, 'Promoted to Master Predictor!')

    return NextResponse.json({
      success: true,
      message: 'Successfully upgraded to AI Master!',
      user: {
        id: upgradedUser.id,
        email: upgradedUser.email,
        name: upgradedUser.name,
        role: upgradedUser.role,
        candyBalance: upgradedUser.candyBalance,
        predictionUnlockUntil: upgradedUser.predictionUnlockUntil,
      },
    })
  } catch (error) {
    console.error('[USER] Failed to upgrade user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upgrade user' },
      { status: 500 }
    )
  }
}