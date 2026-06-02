import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/libs/prisma/client'
import { verifyToken } from '@/libs/auth/jwt'

export async function getCurrentUser(request?: NextRequest) {
  const cookieStore = request ? cookies() : await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  return user
}

export async function requireAuth(request?: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return null
  }
  return user
}

export async function checkPredictionPermission(request?: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return { hasPermission: false, user: null }
  }

  const hasPermission =
    user.predictionUnlockUntil &&
    user.predictionUnlockUntil > new Date()

  return { hasPermission, user }
}