import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma/client'
import { settleMatch } from '@/libs/prediction/user-predictions'
import { getMockMatchSchedule } from '@/libs/services/wheniskickoff'

export const dynamic = 'force-dynamic'

/**
 * Cron Job: Auto-Settlement
 * 
 * Automatically detects finished matches (with scores) that have unsettled predictions,
 * settles them, and posts results to forum.
 * 
 * Schedule: Every 15 minutes
 * 
 * Security: CRON_SECRET or Vercel cron header
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'

  const isAuthorized = isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (!cronSecret && !isVercelCron) // dev mode

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Use CRON_SECRET env var or Vercel cron header.' },
      { status: 401 }
    )
  }

  try {
    console.log('[Cron-Settlement] Starting auto-settlement check...')

    // Get all mock matches that are "finished" with scores
    const matches = getMockMatchSchedule()
    const finishedMatches = matches.filter(
      m => m.status === 'finished' && m.score && m.score.home !== undefined
    )

    const results: {
      matchId: string
      homeTeam: string
      awayTeam: string
      score: string
      settled: number
      correct: number
      status: 'settled' | 'no_predictions' | 'already_settled'
    }[] = []

    for (const match of finishedMatches) {
      // Check if there are any unsettled predictions for this match
      const unsettledCount = await prisma.userPrediction.count({
        where: {
          matchId: match.id,
          isCorrect: null,
        },
      })

      if (unsettledCount === 0) {
        // Check if any predictions exist at all for this match
        const totalCount = await prisma.userPrediction.count({
          where: { matchId: match.id },
        })

        results.push({
          matchId: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          score: `${match.score!.home}-${match.score!.away}`,
          settled: 0,
          correct: 0,
          status: totalCount > 0 ? 'already_settled' : 'no_predictions',
        })
        continue
      }

      // Settle the match
      console.log(`[Cron-Settlement] Settling: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.score!.home}-${match.score!.away})`)
      const settleResult = await settleMatch(match.id, match.score!.home, match.score!.away)

      results.push({
        matchId: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        score: `${match.score!.home}-${match.score!.away}`,
        settled: settleResult.settled,
        correct: settleResult.correct,
        status: 'settled',
      })

      // Auto-post settlement result to forum
      try {
        await publishSettlementToForum(match, settleResult)
      } catch (err: any) {
        console.warn('[Cron-Settlement] Forum post failed:', err.message)
      }
    }

    const totalSettled = results.filter(r => r.status === 'settled').length

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      matchesChecked: finishedMatches.length,
      matchesSettled: totalSettled,
      results,
    })
  } catch (err: any) {
    console.error('[Cron-Settlement] Failed:', err)
    return NextResponse.json(
      { error: 'Settlement cron failed', message: err.message },
      { status: 500 }
    )
  }
}

/**
 * Publish settlement result announcement to forum
 */
async function publishSettlementToForum(
  match: { id: string; homeTeam: { name: string; flag: string }; awayTeam: { name: string; flag: string }; score?: { home: number; away: number }; group: string },
  settleResult: { settled: number; correct: number }
): Promise<void> {
  // Get or create system user
  const SYSTEM_EMAIL = 'ai-predictions@netown.com'
  let systemUser = await prisma.user.findFirst({
    where: { email: SYSTEM_EMAIL },
  })

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: SYSTEM_EMAIL,
        name: 'AI Oracle',
        region: 'GLOBAL',
        role: 'SYSTEM',
        isVerified: true,
      },
    })
  }

  const content = [
    `## 🏁 Match Result: ${match.homeTeam.flag} ${match.homeTeam.name} ${match.score!.home} - ${match.score!.away} ${match.awayTeam.name} ${match.awayTeam.flag}`,
    ``,
    `### Settlement Summary`,
    `- **Predictions settled:** ${settleResult.settled}`,
    `- **Correct predictions:** ${settleResult.correct}`,
    `- **Accuracy:** ${settleResult.settled > 0 ? Math.round((settleResult.correct / settleResult.settled) * 100) : 0}%`,
    ``,
    `> Group: ${match.group}`,
    ``,
    `Check the leaderboard to see how the AI experts and players performed! 🏆`,
    ``,
    `---`,
    `*Auto-generated by AI Oracle • Settlement System*`,
  ].join('\n')

  await prisma.post.create({
    data: {
      content,
      userId: systemUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    },
  })

  console.log(`[Cron-Settlement] Forum post published for ${match.homeTeam.name} vs ${match.awayTeam.name}`)
}
