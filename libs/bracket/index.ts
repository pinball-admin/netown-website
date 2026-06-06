// Bracket Core Logic - Prisma/PostgreSQL backed
// Handles bracket creation, updates, scoring, and leaderboard

import { prisma } from '@/libs/prisma/client'
import { getBracketSlots, isSlotLocked, BracketRound, BracketMatchSlot } from './timeline'
import { calculatePickScore, calculateTotalScore, calculateCandyReward } from './scoring'

export interface BracketPickInput {
  matchSlot: string
  round: BracketRound
  pickedTeamId: string
  pickedTeamName: string
}

/**
 * Create or update a user's bracket entry
 * - First time: creates entry + picks (costs 100 candy)
 * - Update: only allows changes to unlocked slots
 */
export async function createOrUpdateBracket(
  userId: string,
  picks: BracketPickInput[]
): Promise<{ success: boolean; error?: string }> {
  // Validate picks
  if (!picks || picks.length === 0) {
    return { success: false, error: 'No picks provided' }
  }

  // Get all valid slots
  const validSlots = getBracketSlots()
  const slotMap = new Map(validSlots.map(s => [s.slot, s]))

  // Check for existing entry
  let entry = await prisma.bracketEntry.findUnique({ where: { userId } })
  const isNew = !entry

  if (isNew) {
    // Check candy balance
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.candyBalance < 100) {
      return { success: false, error: 'Insufficient candy. Need 100 🍬 to create a bracket.' }
    }
  }

  // Validate each pick
  for (const pick of picks) {
    const slot = slotMap.get(pick.matchSlot)
    if (!slot) {
      return { success: false, error: `Invalid match slot: ${pick.matchSlot}` }
    }
    if (slot.round !== pick.round) {
      return { success: false, error: `Round mismatch for slot ${pick.matchSlot}` }
    }
  }

  // Create or update entry
  if (isNew) {
    entry = await prisma.bracketEntry.create({
      data: {
        userId,
        totalScore: 0,
        candyCost: 100,
        isSubmitted: true,
        submittedAt: new Date(),
      },
    })

    // Deduct candy
    await prisma.user.update({
      where: { id: userId },
      data: { candyBalance: { decrement: 100 } },
    })
  }

  if (!entry) {
    return { success: false, error: 'Failed to create bracket entry' }
  }

  // Upsert picks (only for unlocked slots)
  for (const pick of picks) {
    const slot = slotMap.get(pick.matchSlot)!

    if (isSlotLocked(slot)) {
      // Skip locked slots (don't update)
      continue
    }

    await prisma.bracketPick.upsert({
      where: {
        bracketId_matchSlot: { bracketId: entry.id, matchSlot: pick.matchSlot },
      },
      create: {
        bracketId: entry.id,
        matchSlot: pick.matchSlot,
        round: pick.round,
        pickedTeamId: pick.pickedTeamId,
        pickedTeamName: pick.pickedTeamName,
      },
      update: {
        pickedTeamId: pick.pickedTeamId,
        pickedTeamName: pick.pickedTeamName,
        isCorrect: null, // Reset settlement if teams changed
        pointsEarned: 0,
        settledAt: null,
      },
    })
  }

  // If this was a new entry, create a candy transaction
  if (isNew) {
    await prisma.candyTransaction.create({
      data: {
        userId,
        type: 'BRACKET_ENTRY',
        amount: -100,
        description: 'Bracket Challenge entry fee',
        referenceId: entry.id,
      },
    })
  }

  return { success: true }
}

/**
 * Get a user's bracket entry with picks
 */
export async function getUserBracket(userId: string) {
  const entry = await prisma.bracketEntry.findUnique({
    where: { userId },
    include: {
      picks: {
        orderBy: [{ round: 'asc' }, { matchSlot: 'asc' }],
      },
    },
  })

  if (!entry) return null

  return {
    id: entry.id,
    userId: entry.userId,
    totalScore: entry.totalScore,
    candyCost: entry.candyCost,
    isSubmitted: entry.isSubmitted,
    submittedAt: entry.submittedAt,
    createdAt: entry.createdAt,
    picks: entry.picks.map(p => ({
      id: p.id,
      matchSlot: p.matchSlot,
      round: p.round,
      pickedTeamId: p.pickedTeamId,
      pickedTeamName: p.pickedTeamName,
      isCorrect: p.isCorrect,
      pointsEarned: p.pointsEarned,
      settledAt: p.settledAt,
    })),
  }
}

/**
 * Get bracket leaderboard
 */
export async function getBracketLeaderboard(limit: number = 20) {
  const entries = await prisma.bracketEntry.findMany({
    where: { isSubmitted: true },
    orderBy: [{ totalScore: 'desc' }, { updatedAt: 'asc' }],
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          role: true,
          candyBalance: true,
        },
      },
    },
  })

  return entries.map((entry, index) => ({
    userId: entry.user.id,
    name: entry.user.displayName || entry.user.name,
    role: entry.user.role,
    candyBalance: entry.user.candyBalance,
    totalScore: entry.totalScore,
    ranking: index + 1,
  }))
}

/**
 * Settle a bracket match slot with actual result
 * Evaluates all user picks for this slot and awards points
 */
export async function settleBracketSlot(
  matchSlot: string,
  winnerTeamId: string,
  winnerTeamName: string
): Promise<{ settled: number }> {
  // Get all bracket picks for this match slot
  const picks = await prisma.bracketPick.findMany({
    where: { matchSlot, isCorrect: null },
    include: { bracket: true },
  })

  let settled = 0

  for (const pick of picks) {
    const isCorrect = pick.pickedTeamId === winnerTeamId
    const round = pick.round as BracketRound
    const { pointsEarned } = calculatePickScore(round, isCorrect)

    await prisma.bracketPick.update({
      where: { id: pick.id },
      data: {
        isCorrect,
        pointsEarned,
        settledAt: new Date(),
      },
    })

    // Update entry total score
    if (isCorrect && pointsEarned > 0) {
      await prisma.bracketEntry.update({
        where: { id: pick.bracketId },
        data: { totalScore: { increment: pointsEarned } },
      })
    }

    settled++
  }

  return { settled }
}

/**
 * Settle champion pick separately (the team that wins the final)
 */
export async function settleChampion(
  championTeamId: string
): Promise<{ settled: number }> {
  // Find all bracket entries and check their final picks
  const entries = await prisma.bracketEntry.findMany({
    where: { isSubmitted: true },
    include: {
      picks: {
        where: { matchSlot: 'final' },
      },
    },
  })

  let settled = 0

  for (const entry of entries) {
    const finalPick = entry.picks[0]
    if (!finalPick || finalPick.isCorrect !== null) continue

    const isCorrect = finalPick.pickedTeamId === championTeamId
    const round: BracketRound = 'final'
    const { pointsEarned } = calculatePickScore(round, isCorrect)

    await prisma.bracketPick.update({
      where: { id: finalPick.id },
      data: {
        isCorrect,
        pointsEarned,
        settledAt: new Date(),
      },
    })

    if (isCorrect && pointsEarned > 0) {
      await prisma.bracketEntry.update({
        where: { id: entry.id },
        data: { totalScore: { increment: pointsEarned } },
      })
    }

    settled++
  }

  return { settled }
}

/**
 * Recalculate total score for a bracket entry
 */
export async function recalculateBracketScore(bracketId: string): Promise<number> {
  const picks = await prisma.bracketPick.findMany({
    where: { bracketId },
  })

  const results = picks
    .filter(p => p.isCorrect !== null)
    .map(p => ({
      round: p.round as BracketRound,
      isCorrect: p.isCorrect as boolean,
    }))

  const { total } = calculateTotalScore(results)

  await prisma.bracketEntry.update({
    where: { id: bracketId },
    data: { totalScore: total },
  })

  return total
}
