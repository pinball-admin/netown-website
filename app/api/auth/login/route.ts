import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateToken } from '@/libs/auth/jwt'

// In-memory storage for development
interface User {
  id: string
  email: string
  name: string
  region: string
  role: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  lastLoginAt: Date
  createdAt: Date
  isVerified: boolean
  predictionUnlockUntil: Date | null
}

const users = new Map<string, User>()

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

    // For now, let's accept any 6-digit code for testing
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    let user: User
    const isNewUser = !users.has(email)
    const predictionUnlockUntil = new Date(Date.now() + 48 * 60 * 60 * 1000)

    if (isNewUser) {
      user = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        region: 'GLOBAL',
        role: 'user',
        candyBalance: 100,
        totalPredictions: 0,
        correctPredictions: 0,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        isVerified: true,
        predictionUnlockUntil,
      }
      users.set(email, user)

      console.log(`[AUTH] New user registered: ${email}`)
    } else {
      user = users.get(email)!
      user.lastLoginAt = new Date()
      user.predictionUnlockUntil = predictionUnlockUntil

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