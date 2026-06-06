import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'
import { joinTerritory, leaveTerritory } from '@/libs/territory'

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

    const { teamCode } = await request.json()
    if (!teamCode) {
      return NextResponse.json({ success: false, message: 'teamCode is required' }, { status: 400 })
    }

    const membership = await joinTerritory(payload.userId, teamCode)
    return NextResponse.json({ success: true, membership })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const teamCode = searchParams.get('teamCode')
    if (!teamCode) {
      return NextResponse.json({ success: false, message: 'teamCode is required' }, { status: 400 })
    }

    await leaveTerritory(payload.userId, teamCode)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    )
  }
}
