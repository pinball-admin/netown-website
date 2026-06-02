import { NextResponse } from 'next/server'

export interface User {
  id: string
  email: string
  name: string
  region: 'CN' | 'GLOBAL'
  role: 'user' | 'master' | 'admin'
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  lastLoginAt: Date
  createdAt: Date
  isVerified: boolean
  predictionUnlockTime?: Date
}

export interface VerificationCode {
  email: string
  code: string
  expiresAt: Date
  attempts: number
}

let users: Record<string, User> = {}
let verificationCodes: Record<string, VerificationCode> = {}

export async function generateVerificationCode(email: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  verificationCodes[email] = {
    email,
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0
  }

  console.log(`[DEBUG] Generated verification code for ${email}: ${code}`)
  
  return code
}

export async function verifyCode(email: string, code: string): Promise<{ success: boolean; user?: User }> {
  const verification = verificationCodes[email]
  
  if (!verification) {
    return { success: false }
  }
  
  if (verification.expiresAt < new Date()) {
    delete verificationCodes[email]
    return { success: false }
  }
  
  if (verification.attempts >= 3) {
    return { success: false }
  }
  
  if (verification.code !== code) {
    verification.attempts++
    return { success: false }
  }
  
  delete verificationCodes[email]
  
  let user = users[email]
  const isNewUser = !user
  
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
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
      predictionUnlockTime: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }
    users[email] = user
  } else {
    user.isVerified = true
    user.lastLoginAt = new Date()
    user.predictionUnlockTime = new Date(Date.now() + 48 * 60 * 60 * 1000)
  }
  
  return { success: true, user }
}

export function getUserByEmail(email: string): User | undefined {
  return users[email]
}

export function updateUserRegion(userId: string, region: 'CN' | 'GLOBAL') {
  const user = Object.values(users).find(u => u.id === userId)
  if (user) {
    user.region = region
  }
}

export function getUserById(userId: string): User | undefined {
  return Object.values(users).find(u => u.id === userId)
}

export async function handleLogin(request: Request) {
  const { email, code } = await request.json()
  
  const result = await verifyCode(email, code)
  
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Invalid or expired verification code' }, { status: 400 })
  }
  
  return NextResponse.json({ 
    success: true, 
    user: result.user,
    message: result.user ? 'Login successful' : 'Registration successful'
  })
}

export async function handleSendCode(request: Request) {
  const { email } = await request.json()
  
  if (!email || !email.includes('@')) {
    return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 })
  }
  
  const code = await generateVerificationCode(email)
  
  return NextResponse.json({ 
    success: true, 
    message: 'Verification code sent',
    code: process.env.NODE_ENV === 'development' ? code : undefined
  })
}
