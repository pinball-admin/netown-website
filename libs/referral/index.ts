import { prisma } from '@/libs/prisma/client'
import { createTransaction } from '@/libs/candy/ledger'

const CODE_LENGTH = 8
const REFERRAL_BONUS_REFEREE = 50
const REFERRAL_BONUS_REFERRER = 50

/**
 * Generate a unique referral code for a user
 * Format: random alphanumeric 8 chars (uppercase, no ambiguous chars)
 */
export async function generateReferralCode(userId: string): Promise<string> {
  // Check if user already has a code
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })
  if (existing?.referralCode) {
    return existing.referralCode
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I,O,0,1 to avoid confusion
  let code: string
  let attempts = 0

  do {
    code = ''
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    attempts++
    // Check uniqueness
    const dupe = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    })
    if (!dupe) break
  } while (attempts < 20)

  // Save code to user
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  })

  return code
}

/**
 * Process a referral reward when a new user signs up with a referral code
 * - Referrer gets +50 candy
 * - Referee gets +50 bonus candy
 */
export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<{ referrerId: string | null; refereeBonus: number }> {
  if (!referralCode) return { referrerId: null, refereeBonus: 0 }

  // Find the referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  })

  if (!referrer || referrer.id === newUserId) {
    return { referrerId: null, refereeBonus: 0 }
  }

  // Link the new user to the referrer
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  })

  // Award referrer
  await createTransaction(
    referrer.id,
    'REFERRAL',
    REFERRAL_BONUS_REFERRER,
    'Referral reward: new user signed up with your code'
  )

  // Award referee
  await createTransaction(
    newUserId,
    'REFERRAL',
    REFERRAL_BONUS_REFEREE,
    'Referral bonus: you joined using a referral code'
  )

  return { referrerId: referrer.id, refereeBonus: REFERRAL_BONUS_REFEREE }
}
