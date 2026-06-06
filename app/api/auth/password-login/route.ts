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
    const { email, password, referralCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find user
    let user = await prisma.user.findUnique({ where: { email } })
    const isNewUser = !user

    if (isNewUser) {
      // Register new user with password
      const passwordHash = await bcrypt.hash(password, 12)
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
      console.log(`[AUTH] New user registered with password: ${email}`)
      await createTransaction(user.id, 'SIGNUP', 100, 'Welcome bonus for new user')

      // Process referral if provided
      if (referralCode) {
        await processReferral(user.id, referralCode)
      }
    } else {
      // Verify password for existing user
      if (!user!.passwordHash) {
        return NextResponse.json(
          { success: false, message: 'This account uses email verification. Please login with verification code.' },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user!.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Invalid password' },
          { status: 401 }
        )
      }

      user = await prisma.user.update({
        where: { email },
        data: {
          lastLoginAt: new Date(),
          lastLoginDate: new Date().toISOString().split('T')[0],
        },
      })
      console.log(`[AUTH] User logged in with password: ${email}`)
    }

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
      message: isNewUser ? 'Registration successful' : 'Login successful',
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
    console.error('[AUTH] Password login failed:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}
