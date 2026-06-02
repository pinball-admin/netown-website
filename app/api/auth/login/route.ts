import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and code are required' },
        { status: 400 }
      )
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Find verification token in database
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

    // Check if token has expired
    if (new Date(verificationToken.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Verify the code
    const isValidCode = await bcrypt.compare(code, verificationToken.token)
    if (!isValidCode) {
      // Increment attempts count
      await prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { attempts: verificationToken.attempts + 1 },
      })
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Delete the token after successful verification
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    const isNewUser = !user

    if (isNewUser) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          region: 'GLOBAL',
          role: 'user',
          candyBalance: 100,
          isVerified: true,
          predictionUnlockUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })
      console.log(`[AUTH] New user registered: ${email}`)
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          lastLoginAt: new Date(),
          predictionUnlockUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      })
      console.log(`[AUTH] User logged in: ${email}`)
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
        region: user.region,
        candyBalance: user.candyBalance,
        isNewUser,
      },
    })
  } catch (error) {
    console.error('[AUTH] Login failed:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}