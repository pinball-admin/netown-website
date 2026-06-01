export type TransactionType = 'signup' | 'daily_streak' | 'community_post' | 'prediction_correct' | 'prediction_bonus' | 'conversion' | 'admin_adjustment'

export interface CandyTransaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  description: string
  referenceId?: string
  createdAt: Date
}

export interface UserProfile {
  userId: string
  email: string
  name: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  currentStreak: number
  longestStreak: number
  lastLoginDate: string
  role: 'user' | 'master' | 'admin'
  ranking: number
}

let transactions: CandyTransaction[] = []
let profiles: Record<string, UserProfile> = {}

export function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  description: string,
  referenceId?: string
): CandyTransaction {
  const transaction: CandyTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    amount,
    description,
    referenceId,
    createdAt: new Date()
  }
  
  transactions.push(transaction)
  
  const profile = profiles[userId]
  if (profile) {
    profile.candyBalance += amount
  }
  
  return transaction
}

export function getTransactions(userId: string): CandyTransaction[] {
  return transactions.filter(t => t.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getOrCreateProfile(userId: string, email: string, name: string): UserProfile {
  if (!profiles[userId]) {
    profiles[userId] = {
      userId,
      email,
      name,
      candyBalance: 100,
      totalPredictions: 0,
      correctPredictions: 0,
      currentStreak: 1,
      longestStreak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
      role: 'user',
      ranking: 0
    }
    
    createTransaction(userId, 'signup', 100, 'Welcome bonus for new user')
  }
  
  return profiles[userId]
}

export function processDailyLogin(userId: string): { streak: number; bonus: number } {
  const profile = getOrCreateProfile(userId, '', '')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  let bonus = 10
  let newStreak = 1
  
  if (profile.lastLoginDate === yesterday) {
    newStreak = profile.currentStreak + 1
    bonus = 10 * Math.min(newStreak, 7)
    profile.currentStreak = newStreak
    profile.longestStreak = Math.max(profile.longestStreak, newStreak)
  } else if (profile.lastLoginDate === today) {
    return { streak: profile.currentStreak, bonus: 0 }
  } else {
    profile.currentStreak = 1
  }
  
  profile.lastLoginDate = today
  
  if (bonus > 0) {
    createTransaction(userId, 'daily_streak', bonus, `Daily login streak x${newStreak}`)
  }
  
  return { streak: newStreak, bonus }
}

export function awardCommunityBoost(userId: string, action: 'post' | 'comment' | 'like'): number {
  const rewards: Record<string, number> = {
    post: 20,
    comment: 5,
    like: 1
  }
  
  const reward = rewards[action] || 0
  
  if (reward > 0) {
    createTransaction(userId, 'community_post', reward, `Community boost: ${action}`)
  }
  
  return reward
}

export function recordPrediction(userId: string, isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard'): number {
  const profile = getOrCreateProfile(userId, '', '')
  profile.totalPredictions++
  
  if (!isCorrect) {
    return 0
  }
  
  profile.correctPredictions++
  
  const baseRewards: Record<string, number> = {
    easy: 25,
    medium: 50,
    hard: 100
  }
  
  const accuracyBonus = Math.floor((profile.correctPredictions / profile.totalPredictions) * 10)
  const reward = baseRewards[difficulty] + accuracyBonus
  
  createTransaction(userId, 'prediction_correct', reward, `Prediction correct (${difficulty})`)
  
  checkMasterPromotion(profile)
  
  return reward
}

export function checkMasterPromotion(profile: UserProfile) {
  if (profile.role === 'master') return
  
  if (profile.totalPredictions >= 20) {
    const recentAccuracy = profile.correctPredictions / profile.totalPredictions
    if (recentAccuracy >= 0.75) {
      profile.role = 'master'
      createTransaction(profile.userId, 'admin_adjustment', 1000, 'Promoted to Master Predictor')
    }
  }
}

export function getLeaderboard(): UserProfile[] {
  return Object.values(profiles)
    .filter(p => p.totalPredictions >= 5)
    .sort((a, b) => {
      const accA = a.totalPredictions > 0 ? a.correctPredictions / a.totalPredictions : 0
      const accB = b.totalPredictions > 0 ? b.correctPredictions / b.totalPredictions : 0
      return accB - accA
    })
    .map((p, index) => {
      p.ranking = index + 1
      return p
    })
}

export function convertToTokens(userId: string, amount: number): boolean {
  const profile = profiles[userId]
  if (!profile || profile.candyBalance < amount) return false
  if (profile.role !== 'master') return false
  
  createTransaction(userId, 'conversion', -amount, `Converted ${amount} candy to tokens`)
  
  return true
}

export function getProfile(userId: string): UserProfile | undefined {
  return profiles[userId]
}

export function updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | undefined {
  const profile = profiles[userId]
  if (!profile) return undefined
  
  Object.assign(profile, updates)
  return profile
}
