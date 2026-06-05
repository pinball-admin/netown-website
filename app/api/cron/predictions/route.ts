import { NextResponse } from 'next/server'
import { runPredictionPipeline } from '@/libs/prediction/prediction-pipeline'

export const dynamic = 'force-dynamic'

/**
 * Cron Job: Automated Prediction Pipeline
 * 
 * Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
 * 
 * Schedule: Every 6 hours
 * Runs predictions for all matches within 48h window
 * Auto-publishes multi-model analysis to forum
 * 
 * Security: Uses CRON_SECRET env var for verification
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends x-vercel-cron header for scheduled jobs)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'

  // Allow: Vercel cron jobs (automatic), or Bearer token auth (manual), or no secret configured (dev)
  const isAuthorized = isVercelCron || 
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (!cronSecret && !isVercelCron) // dev mode: no secret set

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Use CRON_SECRET env var or Vercel cron header.' },
      { status: 401 }
    )
  }

  try {
    console.log('[Cron] Starting scheduled prediction pipeline...')

    const result = await runPredictionPipeline({
      limit: 16,
      publish: true,
      windowHours: 48,
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: result.processed,
      published: result.published,
      errors: result.errors.length,
      models: ['Dixon-Coles', 'ELO', 'xG', 'Gradient Boosting', 'News/Injury'],
    })
  } catch (err: any) {
    console.error('[Cron] Pipeline failed:', err)
    return NextResponse.json(
      { error: 'Pipeline failed', message: err.message },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for manual triggering with options
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { limit, publish, windowHours } = body

    console.log('[Cron] Manual pipeline trigger:', { limit, publish, windowHours })

    const result = await runPredictionPipeline({
      limit: limit || 16,
      publish: publish ?? true,
      windowHours: windowHours || 48,
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
      results: result.results.map(r => ({
        match: `${r.match.homeTeam} vs ${r.match.awayTeam}`,
        ensemble: r.ensemble ? {
          homeWin: `${r.ensemble.homeWinProb.toFixed(1)}%`,
          draw: `${r.ensemble.drawProb.toFixed(1)}%`,
          awayWin: `${r.ensemble.awayWinProb.toFixed(1)}%`,
          score: `${r.ensemble.predictedScore.home}-${r.ensemble.predictedScore.away}`,
        } : null,
        xg: r.xg ? `${r.xg.expectedHomeGoals}-${r.xg.expectedAwayGoals}` : null,
        gb: r.gb ? `${r.gb.predictedHomeGoals}-${r.gb.predictedAwayGoals}` : null,
        news: r.news?.newsSummary || null,
        published: r.published,
      })),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Pipeline failed', message: err.message },
      { status: 500 }
    )
  }
}
