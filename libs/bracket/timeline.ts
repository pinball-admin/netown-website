// Bracket Timeline - Knockout stage schedule for World Cup 2026
// Defines the match slots and lock times for each round

export interface BracketMatchSlot {
  slot: string        // e.g., "r32-1", "r16-1", "qf-1", "sf-1", "final"
  round: BracketRound
  label: string       // Display label e.g., "Round of 32 #1"
  lockDate: string    // ISO date string when this match locks
  homeTeamId?: string // Set when bracket is configured
  awayTeamId?: string
  homeTeamName?: string
  awayTeamName?: string
  actualHomeScore?: number
  actualAwayScore?: number
}

export type BracketRound = 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final'

export const BRACKET_ROUNDS: { round: BracketRound; label: string; multiplier: number; matchCount: number; emoji: string }[] = [
  { round: 'round_of_32', label: 'Round of 32', multiplier: 1, matchCount: 16, emoji: '🌊' },
  { round: 'round_of_16', label: 'Round of 16', multiplier: 2, matchCount: 8, emoji: '🔥' },
  { round: 'quarter_final', label: 'Quarter-finals', multiplier: 3, matchCount: 4, emoji: '⚡' },
  { round: 'semi_final', label: 'Semi-finals', multiplier: 4, matchCount: 2, emoji: '💫' },
  { round: 'final', label: 'Final', multiplier: 6, matchCount: 1, emoji: '🏆' },
]

// Lock times based on typical World Cup 2026 knockout schedule
// (approximate dates, can be adjusted when actual schedule is confirmed)
const LOCK_DATES: Record<string, string> = {
  // Round of 32: June 26-29
  'r32-1': '2026-06-26T14:00:00Z',
  'r32-2': '2026-06-26T18:00:00Z',
  'r32-3': '2026-06-27T14:00:00Z',
  'r32-4': '2026-06-27T18:00:00Z',
  'r32-5': '2026-06-28T14:00:00Z',
  'r32-6': '2026-06-28T18:00:00Z',
  'r32-7': '2026-06-29T14:00:00Z',
  'r32-8': '2026-06-29T18:00:00Z',
  'r32-9': '2026-06-30T14:00:00Z',
  'r32-10': '2026-06-30T18:00:00Z',
  'r32-11': '2026-07-01T14:00:00Z',
  'r32-12': '2026-07-01T18:00:00Z',
  'r32-13': '2026-07-02T14:00:00Z',
  'r32-14': '2026-07-02T18:00:00Z',
  'r32-15': '2026-07-03T14:00:00Z',
  'r32-16': '2026-07-03T18:00:00Z',
  // Round of 16: July 5-8
  'r16-1': '2026-07-05T14:00:00Z',
  'r16-2': '2026-07-05T18:00:00Z',
  'r16-3': '2026-07-06T14:00:00Z',
  'r16-4': '2026-07-06T18:00:00Z',
  'r16-5': '2026-07-07T14:00:00Z',
  'r16-6': '2026-07-07T18:00:00Z',
  'r16-7': '2026-07-08T14:00:00Z',
  'r16-8': '2026-07-08T18:00:00Z',
  // Quarter-finals: July 10-12
  'qf-1': '2026-07-10T14:00:00Z',
  'qf-2': '2026-07-10T18:00:00Z',
  'qf-3': '2026-07-11T14:00:00Z',
  'qf-4': '2026-07-11T18:00:00Z',
  // Semi-finals: July 14-15
  'sf-1': '2026-07-14T18:00:00Z',
  'sf-2': '2026-07-15T18:00:00Z',
  // Final: July 19
  'final': '2026-07-19T16:00:00Z',
}

/**
 * Get all bracket match slots with their lock times
 */
export function getBracketSlots(): BracketMatchSlot[] {
  const slots: BracketMatchSlot[] = []

  // Round of 32 (16 matches)
  for (let i = 1; i <= 16; i++) {
    const slot = `r32-${i}`
    slots.push({
      slot,
      round: 'round_of_32',
      label: `Round of 32 #${i}`,
      lockDate: LOCK_DATES[slot],
    })
  }

  // Round of 16 (8 matches)
  for (let i = 1; i <= 8; i++) {
    const slot = `r16-${i}`
    slots.push({
      slot,
      round: 'round_of_16',
      label: `Round of 16 #${i}`,
      lockDate: LOCK_DATES[slot],
    })
  }

  // Quarter-finals (4 matches)
  for (let i = 1; i <= 4; i++) {
    const slot = `qf-${i}`
    slots.push({
      slot,
      round: 'quarter_final',
      label: `Quarter-final #${i}`,
      lockDate: LOCK_DATES[slot],
    })
  }

  // Semi-finals (2 matches)
  for (let i = 1; i <= 2; i++) {
    const slot = `sf-${i}`
    slots.push({
      slot,
      round: 'semi_final',
      label: `Semi-final #${i}`,
      lockDate: LOCK_DATES[slot],
    })
  }

  // Final
  slots.push({
    slot: 'final',
    round: 'final',
    label: 'Final',
    lockDate: LOCK_DATES['final'],
  })

  return slots
}

/**
 * Get bracket slots for a specific round
 */
export function getSlotsByRound(round: BracketRound): BracketMatchSlot[] {
  return getBracketSlots().filter(s => s.round === round)
}

/**
 * Check if a slot is locked (past its lock time)
 */
export function isSlotLocked(slot: BracketMatchSlot): boolean {
  return new Date(slot.lockDate) <= new Date()
}

/**
 * Get the multiplier for a round
 */
export function getRoundMultiplier(round: BracketRound): number {
  const found = BRACKET_ROUNDS.find(r => r.round === round)
  return found?.multiplier || 1
}
