import { prisma } from '@/libs/prisma/client'
import { getMockMatchSchedule } from '@/libs/services/wheniskickoff'

export interface LiveScoreEntry {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'scheduled' | 'live' | 'ht' | 'finished'
  minute: string | null
  round: string
}

/**
 * Fetch and persist live scores from external source.
 * 
 * Strategy:
 * 1. Attempt to scrape ESPN scoreboard HTML
 * 2. If scraping fails or returns empty, fall back to simulation mode
 *    which progresses mock match statuses based on time
 */
export async function refreshLiveScores(): Promise<{ updated: number; live: number }> {
  try {
    // Try real scraping first
    const scraped = await scrapeFromESPN()
    if (scraped.length > 0) {
      await persistScores(scraped)
      const liveCount = scraped.filter(s => s.status === 'live' || s.status === 'ht').length
      return { updated: scraped.length, live: liveCount }
    }
  } catch (e) {
    console.warn('[LiveScore] ESPN scrape failed, using simulation:', e)
  }

  // Fallback: simulation mode
  const simulated = simulateScores()
  await persistScores(simulated)
  const liveCount = simulated.filter(s => s.status === 'live' || s.status === 'ht').length
  return { updated: simulated.length, live: liveCount }
}

/**
 * Scrape ESPN FC scoreboard
 */
async function scrapeFromESPN(): Promise<LiveScoreEntry[]> {
  const today = new Date().toISOString().split('T')[0]
  const urls = [
    `https://www.espn.com/soccer/scoreboard/_/date/${today.replace(/-/g, '')}`,
    'https://www.espn.com/soccer/scoreboard/_/league/fifa.world/date/20260611',
  ]

  const results: LiveScoreEntry[] = []

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      })
      if (!res.ok) continue

      const html = await res.text()
      const { load } = await import('cheerio')
      const $ = load(html)

      // ESPN scoreboard: each match is in an article/div with specific class patterns
      $('.ScoreboardScoreCell__Competitors, .event, [data-testid="matchCard"]').each((_: number, el: any) => {
        const text = $(el).text()
        const teamMatch = text.match(/([A-Z]{3})\s*(\d+)\s*[-–]\s*(\d+)\s*([A-Z]{3})/)
        if (teamMatch) {
          results.push({
            id: `espn-${Date.now()}-${results.length}`,
            homeTeam: teamMatch[1],
            awayTeam: teamMatch[4],
            homeScore: parseInt(teamMatch[2]),
            awayScore: parseInt(teamMatch[3]),
            status: 'live',
            minute: extractMinute(text),
            round: 'Group Stage',
          })
        }
      })

      if (results.length > 0) break
    } catch {
      continue
    }
  }

  return results
}

/**
 * Extract match minute from text (e.g., "45+2'", "HT", "FT")
 */
function extractMinute(text: string): string | null {
  const minuteMatch = text.match(/(\d+[\+']?\d*)\s*['\u2019]/)
  if (minuteMatch) return minuteMatch[1]
  if (text.includes('Halftime') || text.includes('HT')) return 'HT'
  if (text.includes('Fulltime') || text.includes('FT')) return 'FT'
  return null
}

/**
 * Simulation mode: progress mock matches through live/finished states
 * based on the current time relative to match kickoff.
 */
function simulateScores(): LiveScoreEntry[] {
  const mockMatches = getMockMatchSchedule()
  const now = new Date()
  const results: LiveScoreEntry[] = []

  for (const match of mockMatches) {
    const kickoff = new Date(`${match.date}T${match.time}:00`)
    const diffMs = now.getTime() - kickoff.getTime()
    const diffMin = diffMs / 60000

    let status: LiveScoreEntry['status'] = 'scheduled'
    let homeScore = 0
    let awayScore = 0
    let minute: string | null = null

    if (diffMin < 0) {
      // Match hasn't started yet
      status = 'scheduled'
    } else if (diffMin < 45) {
      // First half
      status = 'live'
      minute = `${Math.floor(diffMin)}'`
      homeScore = simulateGoal(diffMin, 0.035)
      awayScore = simulateGoal(diffMin, 0.025)
    } else if (diffMin < 60) {
      // Half time
      status = 'ht'
      minute = 'HT'
      homeScore = simulateGoal(45, 0.035)
      awayScore = simulateGoal(45, 0.025)
    } else if (diffMin < 105) {
      // Second half
      status = 'live'
      const secondHalfMin = diffMin - 15 // 15 min HT break
      minute = `${Math.floor(secondHalfMin)}'`
      homeScore = simulateGoal(45, 0.035) + simulateGoal(secondHalfMin - 45, 0.04)
      awayScore = simulateGoal(45, 0.025) + simulateGoal(secondHalfMin - 45, 0.03)
    } else {
      // Finished
      status = 'finished'
      minute = 'FT'
      homeScore = simulateGoal(45, 0.035) + simulateGoal(45, 0.04)
      awayScore = simulateGoal(45, 0.025) + simulateGoal(45, 0.03)
    }

    results.push({
      id: match.id,
      homeTeam: match.homeTeam.shortName || match.homeTeam.id,
      awayTeam: match.awayTeam.shortName || match.awayTeam.id,
      homeScore,
      awayScore,
      status,
      minute,
      round: match.round,
    })
  }

  return results
}

/**
 * Simulate goals over a period using Poisson-like distribution.
 * Returns number of goals scored in `minutes` with `rate` goals/min.
 */
function simulateGoal(minutes: number, rate: number): number {
  const expected = minutes * rate
  // Simple Poisson approximation
  let goals = 0
  let prob = Math.exp(-expected)
  let cumProb = prob
  const rand = Math.random()
  while (rand > cumProb && goals < 6) {
    goals++
    prob *= expected / goals
    cumProb += prob
  }
  return goals
}

/**
 * Persist score entries to database (upsert).
 */
async function persistScores(entries: LiveScoreEntry[]): Promise<void> {
  for (const entry of entries) {
    try {
      await prisma.liveMatch.upsert({
        where: {
          homeTeam_awayTeam: {
            homeTeam: entry.homeTeam,
            awayTeam: entry.awayTeam,
          },
        },
        create: {
          id: entry.id,
          homeTeam: entry.homeTeam,
          awayTeam: entry.awayTeam,
          homeScore: entry.homeScore,
          awayScore: entry.awayScore,
          status: entry.status,
          minute: entry.minute,
          round: entry.round,
        },
        update: {
          homeScore: entry.homeScore,
          awayScore: entry.awayScore,
          status: entry.status,
          minute: entry.minute,
          round: entry.round,
        },
      })
    } catch (e) {
      // Skip duplicates silently
    }
  }
}

/**
 * Get all live scores from database
 */
export async function getLiveScores(): Promise<LiveScoreEntry[]> {
  const scores = await prisma.liveMatch.findMany({
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  })

  return scores.map(s => ({
    id: s.id,
    homeTeam: s.homeTeam,
    awayTeam: s.awayTeam,
    homeScore: s.homeScore,
    awayScore: s.awayScore,
    status: s.status as LiveScoreEntry['status'],
    minute: s.minute,
    round: s.round,
  }))
}

/**
 * Get live scores for specific match IDs
 */
export async function getLiveScoresByIds(matchIds: string[]): Promise<LiveScoreEntry[]> {
  const scores = await prisma.liveMatch.findMany({
    where: { id: { in: matchIds } },
  })

  return scores.map(s => ({
    id: s.id,
    homeTeam: s.homeTeam,
    awayTeam: s.awayTeam,
    homeScore: s.homeScore,
    awayScore: s.awayScore,
    status: s.status as LiveScoreEntry['status'],
    minute: s.minute,
    round: s.round,
  }))
}
