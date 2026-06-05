import { NextResponse } from 'next/server'
import { settleMatch } from '@/libs/prediction/user-predictions'
import { prisma } from '@/libs/prisma/client'
import { cookies } from 'next/headers'
import { verifyToken } from '@/libs/auth/jwt'

export const dynamic = 'force-dynamic'

/**
 * POST /api/matches/result
 * 
 * Enter match result and auto-settle predictions.
 * This is the unified endpoint for both admin UI and cron jobs.
 * 
 * Body: { matchId: string, homeScore: number, awayScore: number, status?: string }
 * 
 * When called with scores, it:
 * 1. Validates authorization
 * 2. Settles all predictions for the match
 * 3. Creates a settlement announcement in the forum
 * 4. Returns settlement stats
 */
export async function POST(request: Request) {
  try {
    // Auth: token or API key
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.ADMIN_API_KEY

    let isAdmin = false
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        // Check user role
        const user = await prisma.user.findUnique({
          where: { email: payload.email },
        })
        isAdmin = user?.role === 'admin' || user?.role === 'master' || !!user
      }
    } else if (apiKey && authHeader === `Bearer ${apiKey}`) {
      isAdmin = true
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { matchId, homeScore, awayScore } = await request.json()

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { success: false, message: 'matchId, homeScore, and awayScore are required' },
        { status: 400 }
      )
    }

    const hScore = Number(homeScore)
    const aScore = Number(awayScore)

    if (isNaN(hScore) || isNaN(aScore) || hScore < 0 || aScore < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid score values' },
        { status: 400 }
      )
    }

    // Settle predictions
    const result = await settleMatch(matchId, hScore, aScore)

    // Post settlement to forum
    let postId: string | null = null
    try {
      postId = await publishResultToForum(matchId, hScore, aScore, result)
    } catch (err: any) {
      console.warn('[MatchResult] Forum post failed:', err.message)
    }

    // Determine match outcome
    const winner = hScore > aScore ? 'home' : aScore > hScore ? 'away' : 'draw'

    return NextResponse.json({
      success: true,
      message: `Match settled: ${result.settled} predictions, ${result.correct} correct`,
      matchId,
      homeScore: hScore,
      awayScore: aScore,
      winner,
      settled: result.settled,
      correct: result.correct,
      accuracy: result.settled > 0 ? Math.round((result.correct / result.settled) * 100) : 0,
      forumPostId: postId,
    })
  } catch (error: any) {
    console.error('[MatchResult] Settlement failed:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Settlement failed' },
      { status: 500 }
    )
  }
}

/**
 * Get settlement results for a match
 * GET /api/matches/result?matchId=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json(
        { success: false, message: 'matchId is required' },
        { status: 400 }
      )
    }

    const predictions = await prisma.userPrediction.findMany({
      where: { matchId },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    const settled = predictions.filter(p => p.isCorrect !== null)
    const correct = settled.filter(p => p.isCorrect === true)
    const pending = predictions.filter(p => p.isCorrect === null)

    return NextResponse.json({
      success: true,
      matchId,
      totalPredictions: predictions.length,
      settled: settled.length,
      correct: correct.length,
      pending: pending.length,
      accuracy: settled.length > 0 ? Math.round((correct.length / settled.length) * 100) : 0,
      predictions: predictions.map(p => ({
        id: p.id,
        userName: p.user.name,
        userEmail: p.user.email,
        type: p.predictionType,
        prediction: p.prediction,
        isCorrect: p.isCorrect,
        pointsAwarded: p.pointsAwarded,
        settledAt: p.settledAt,
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

/**
 * Publish match result to forum
 */
async function publishResultToForum(
  matchId: string,
  homeScore: number,
  awayScore: number,
  result: { settled: number; correct: number }
): Promise<string | null> {
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

  // Try to get match info from mock data
  const { getMockMatchSchedule } = await import('@/libs/services/wheniskickoff')
  const matches = getMockMatchSchedule()
  const match = matches.find(m => m.id === matchId)

  const homeName = match?.homeTeam.name || 'Home Team'
  const awayName = match?.awayTeam.name || 'Away Team'
  const homeFlag = match?.homeTeam.flag || '⚽'
  const awayFlag = match?.awayTeam.flag || '⚽'
  const group = match?.group || 'Unknown'

  const winner = homeScore > awayScore ? homeName : awayScore > homeScore ? awayName : 'Draw'
  const winnerEmoji = homeScore > awayScore ? homeFlag : awayScore > homeScore ? awayFlag : '🤝'

  const content = [
    `## 🏁 Final Result: ${homeFlag} ${homeName} ${homeScore} - ${awayScore} ${awayName} ${awayFlag}`,
    ``,
    `${winnerEmoji} **Winner:** ${winner}`,
    ``,
    `### 📊 Settlement Report`,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Predictions Settled | ${result.settled} |`,
    `| Correct Predictions | ${result.correct} |`,
    `| Community Accuracy | ${result.settled > 0 ? Math.round((result.correct / result.settled) * 100) : 0}% |`,
    ``,
    `> 🏟 Group: ${group}`,
    ``,
    `How did your prediction do? Check the [Leaderboard](/football) to see your ranking! 🏆`,
    ``,
    `---`,
    `*Auto-settled by AI Oracle • ${new Date().toISOString().split('T')[0]}*`,
  ].join('\n')

  const post = await prisma.post.create({
    data: {
      content,
      userId: systemUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    },
  })

  return post.id
}
