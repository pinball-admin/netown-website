import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/libs/prisma/client'
import { generateToken } from '@/libs/auth/jwt'
import { createTransaction } from '@/libs/candy/ledger'
import { processReferral } from '@/libs/referral'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, code, password, referralCode } = await request.json()

    if (!email || !code || !password) {
      return NextResponse.json(
        { success: false, message: 'Email, code, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Find and verify the code
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: 'No verification code found. Please request a new code.' },
        { status: 400 }
      )
    }

    if (new Date(verificationToken.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    const isValidCode = await bcrypt.compare(code, verificationToken.token)
    if (!isValidCode) {
      await prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { attempts: verificationToken.attempts + 1 },
      })
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Delete the token after verification
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    // Find or create user, and set password
    const passwordHash = await bcrypt.hash(password, 12)
    let user = await prisma.user.findUnique({ where: { email } })
    const isNewUser = !user

    if (isNewUser) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          displayName: email.split('@')[0],
          passwordHash,
          region: 'GLOBAL',
          role: 'user',
          candyBalance: 1000,
          isVerified: true,
          predictionUnlockUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
          lastLoginDate: new Date().toISOString().split('T')[0],
        },
      })
      console.log(`[AUTH] New user registered with password via code: ${email}`)
      await createTransaction(user.id, 'SIGNUP', 100, 'Welcome bonus for new user')

      // Process referral if provided
      if (referralCode) {
        await processReferral(user.id, referralCode)
      }
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          lastLoginAt: new Date(),
          lastLoginDate: new Date().toISOString().split('T')[0],
          predictionUnlockUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })
      console.log(`[AUTH] Password set for existing user: ${email}`)
    }

    // Generate token and set cookie
    const token = generateToken(user)

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'Password set successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        region: user.region,
        role: user.role,
        candyBalance: user.candyBalance,
        isVerified: user.isVerified,
        preferredLanguage: user.preferredLanguage,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isNewUser,
      },
    })
  } catch (error) {
    console.error('[AUTH] Set password failed:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to set password' },
      { status: 500 }
    )
  }
}
