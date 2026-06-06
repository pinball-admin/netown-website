import { NextResponse } from 'next/server'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'
import { prisma } from '@/libs/prisma/client'
import { generateReferralCode } from '@/libs/referral'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/referral
 * Returns the current user's referral code + link and referral stats
 */
export async function GET() {
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

    // Get or generate referral code
    const referralCode = await generateReferralCode(payload.userId)

    // Get referral stats
    const referrals = await prisma.user.findMany({
      where: { referredById: payload.userId },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    // Get total referral earnings
    const earnings = await prisma.candyTransaction.aggregate({
      where: {
        userId: payload.userId,
        type: 'REFERRAL',
      },
      _sum: { amount: true },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netown.app'

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink: `${baseUrl}?ref=${referralCode}`,
        referralCount: referrals.length,
        totalEarnings: earnings._sum.amount || 0,
        referrals: referrals.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          joinedAt: r.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('[REFERRAL] Failed to fetch referral info:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch referral info' },
      { status: 500 }
    )
  }
}
