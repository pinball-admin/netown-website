import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'

// Import the users map from login route (we'll need to share it)
// For now, let's create a shared storage
const users = new Map<string, any>()

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

    // Find user or create a mock one
    let user = users.get(payload.email)
    if (!user) {
      user = {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        region: payload.region,
        role: 'user',
        candyBalance: 100,
        totalPredictions: 0,
        correctPredictions: 0,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        isVerified: true,
        predictionUnlockUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }
      users.set(payload.email, user)
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('[AUTH] Failed to get user:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get user' },
      { status: 500 }
    )
  }
}