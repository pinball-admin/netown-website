import { NextResponse } from 'next/server'
import { refreshLiveScores } from '@/libs/services/livescore-scraper'

export const dynamic = 'force-dynamic'

/**
 * POST /api/livescores/refresh
 * 
 * Triggers the live score scraper to fetch latest scores.
 * Protected by CRON_SECRET or Vercel cron header.
 * 
 * Body: (empty, uses auth headers)
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await refreshLiveScores()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[LiveScores] Refresh failed:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
