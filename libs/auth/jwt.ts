import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  region: string
}

export interface User {
  id: string
  email: string
  name: string
  region: string
}

export function generateToken(user: User) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      region: user.region,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}