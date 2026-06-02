'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  region: string
  role: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  isVerified: boolean
  predictionUnlockUntil: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isLoggedIn: boolean
  login: (userData: any) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshUser()
  }, [])

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('[AUTH] Failed to fetch user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: any) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('[AUTH] Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}