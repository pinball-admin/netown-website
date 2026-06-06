import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/libs/prisma/client'
import { verifyToken } from '@/libs/auth/jwt'

export const dynamic = 'force-dynamic'

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

    const { displayName, bio, preferredLanguage } = await request.json()

    // Build update data
    const updateData: any = {}
    if (displayName !== undefined) updateData.displayName = displayName?.trim() || null
    if (bio !== undefined) updateData.bio = bio?.trim() || null
    if (preferredLanguage !== undefined) {
      const validLangs = ['en', 'zh', 'es', 'de', 'it', 'ja', 'ko', 'pt']
      if (!validLangs.includes(preferredLanguage)) {
        return NextResponse.json(
          { success: false, message: 'Invalid language code' },
          { status: 400 }
        )
      }
      updateData.preferredLanguage = preferredLanguage
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { email: payload.email },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        bio: user.bio,
        region: user.region,
        role: user.role,
        candyBalance: user.candyBalance,
        preferredLanguage: user.preferredLanguage,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error('[USER] Update profile failed:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
