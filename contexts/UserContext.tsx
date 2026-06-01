'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
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

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('netown-user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        parsedUser.lastLoginAt = new Date(parsedUser.lastLoginAt)
        parsedUser.createdAt = new Date(parsedUser.createdAt)
        if (parsedUser.predictionUnlockTime) {
          parsedUser.predictionUnlockTime = new Date(parsedUser.predictionUnlockTime)
        }
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
      }
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('netown-user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('netown-user')
  }

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem('netown-user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
