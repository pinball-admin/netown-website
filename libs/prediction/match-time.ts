/**
 * Match Time Lookup
 * 
 * Maps match IDs to their scheduled date+time for validation checks.
 * Used by the prediction creation API to enforce the 48-hour prediction window.
 * 
 * Match IDs follow the pattern: wc2026-match-{N} where N is 1-based sequential.
 * - Group stage: match-1 to match-72 (12 groups × 6 matches)
 * - Round of 16: match-73 to match-88 (16 matches)
 * - Quarter-finals: match-89 to match-96 (8 matches)
 * - Semi-finals: match-97 to match-98 (2 matches)
 * - 3rd place: match-99
 * - Final: match-100
 */

import { getAllUpcomingMatches, getKnockoutMatches, StaticMatch } from '@/libs/data/worldcup-schedule'

// Lazy-built map: match index (1-based) → date string
let matchScheduleMap: Map<number, string> | null = null

function buildScheduleMap(): Map<number, string> {
  const map = new Map<number, string>()
  let idx = 1

  // Group stage matches (A-L, 12 groups × 6 matches = 72)
  const allGroupMatches = getAllUpcomingMatches()
  for (const m of allGroupMatches) {
    map.set(idx, `${m.date}T${m.time}:00`)
    idx++
  }

  // Knockout stages
  const stages = ['roundOf16', 'quarterFinals', 'semiFinals', 'final', 'thirdPlace']
  for (const stage of stages) {
    const matches = getKnockoutMatches(stage)
    for (const m of matches) {
      map.set(idx, `${m.date}T${m.time}:00`)
      idx++
    }
  }

  return map
}

function getScheduleMap(): Map<number, string> {
  if (!matchScheduleMap) {
    matchScheduleMap = buildScheduleMap()
  }
  return matchScheduleMap
}

/**
 * Extract the numeric match index from a matchId like "wc2026-match-42"
 */
function parseMatchIndex(matchId: string): number | null {
  const match = matchId.match(/match[-\s]?(\d+)/i)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Get the scheduled date+time for a match by its ID
 * Returns the UTC date string in ISO format, or null if not found
 */
export function getMatchDateTime(matchId: string): Date | null {
  const idx = parseMatchIndex(matchId)
  if (!idx) return null

  const dtStr = getScheduleMap().get(idx)
  if (!dtStr) return null

  const d = new Date(dtStr)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Check if a prediction can be made for the given match.
 * Predictions are only allowed within PREDICTION_WINDOW_HOURS (48) before the match.
 * This prevents "oracle farming" by ensuring predictions are time-bound.
 * 
 * @param matchId - The match ID to check
 * @returns { allowed: boolean; matchTime: Date | null; reason?: string }
 */
export function canPredictForMatch(matchId: string): {
  allowed: boolean
  matchTime: Date | null
  reason?: string
} {
  const matchTime = getMatchDateTime(matchId)

  if (!matchTime) {
    // If we can't find the match time, allow prediction but log a warning
    console.warn(`[MatchTime] Could not resolve match time for ID: ${matchId}, allowing prediction`)
    return { allowed: true, matchTime: null }
  }

  const now = new Date()
  const msUntilMatch = matchTime.getTime() - now.getTime()
  const hoursUntilMatch = msUntilMatch / (1000 * 60 * 60)
  const PREDICTION_WINDOW_HOURS = 48

  // Match must be within the prediction window (48h)
  if (hoursUntilMatch < 0) {
    return {
      allowed: false,
      matchTime,
      reason: 'This match has already started or finished',
    }
  }

  if (hoursUntilMatch > PREDICTION_WINDOW_HOURS) {
    return {
      allowed: false,
      matchTime,
      reason: `Predictions open ${PREDICTION_WINDOW_HOURS}h before kickoff (currently ${Math.round(hoursUntilMatch)}h away)`,
    }
  }

  return { allowed: true, matchTime }
}
