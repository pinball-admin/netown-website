import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}