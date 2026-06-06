import { NextResponse } from 'next/server'
import { refreshLiveScores } from '@/libs/services/livescore-scraper'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/livescores
 * 
 * Vercel Cron job entry point.
 * Runs every 5 minutes during match windows to refresh live scores.
 * 
 * Security: Vercel cron header or CRON_SECRET
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'

    const isAuthorized = isVercelCron ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (!cronSecret && !isVercelCron) // dev mode fallback

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Use CRON_SECRET env var or Vercel cron header.' },
        { status: 401 }
      )
    }

    console.log('[Cron-LiveScores] Refreshing live scores...')
    const result = await refreshLiveScores()

    console.log(`[Cron-LiveScores] Done. ${result.updated} matches, ${result.live} live.`)
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Cron-LiveScores] Failed:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
