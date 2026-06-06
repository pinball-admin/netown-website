import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/libs/prisma/client'
import { verifyToken, JWTPayload } from '@/libs/auth/jwt'

export async function requireAdmin(request?: NextRequest): Promise<{ user: any; payload: JWTPayload } | null> {
  let token: string | undefined

  if (request) {
    token = request.cookies.get('auth_token')?.value
  } else {
    const cookieStore = await cookies()
    token = cookieStore.get('auth_token')?.value
  }

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // JWT-level role check (fast path)
  if (payload.role !== 'admin') return null

  // Database-level confirmation (catches role demotion)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })
  if (!user || user.role !== 'admin') return null

  return { user, payload }
}
