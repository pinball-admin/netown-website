import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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

    const { endpoint, p256dh, auth } = await request.json()
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ success: false, message: 'Missing push subscription keys' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Upsert subscription by endpoint
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userId: user.id },
      create: { endpoint, p256dh, auth, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUSH SUBSCRIBE] Failed:', error)
    return NextResponse.json({ success: false, message: 'Failed to save subscription' }, { status: 500 })
  }
}
