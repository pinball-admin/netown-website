import { NextResponse } from 'next/server'
import { getLiveScores, getLiveScoresByIds } from '@/libs/services/livescore-scraper'

export const dynamic = 'force-dynamic'

/**
 * GET /api/livescores
 * 
 * Returns live scores for frontend polling.
 * Query params:
 *   - matchIds (optional): comma-separated list of match IDs to filter
 * 
 * Response matches the format expected by useSmartPolling hook:
 * {
 *   success: true,
 *   results: [{ id, homeScore, awayScore, status, minute, homeTeam, awayTeam }]
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchIdsParam = searchParams.get('matchIds')
    const matchIds = matchIdsParam
      ? matchIdsParam.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const scores = matchIds.length > 0
      ? await getLiveScoresByIds(matchIds)
      : await getLiveScores()

    const results = scores.map(s => ({
      id: s.id,
      matchId: s.id,
      home: s.homeScore,
      away: s.awayScore,
      homeScore: s.homeScore,
      awayScore: s.awayScore,
      status: s.status,
      minute: s.minute,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      round: s.round,
    }))

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('[LiveScores] GET failed:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
