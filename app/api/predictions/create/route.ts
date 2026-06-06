import { NextResponse } from 'next/server'
import { createPrediction } from '@/libs/prediction/user-predictions'
import { verifyToken } from '@/libs/auth/jwt'
import { cookies } from 'next/headers'
import { prisma } from '@/libs/prisma/client'
import { canPredictForMatch } from '@/libs/prediction/match-time'

export const dynamic = 'force-dynamic'

const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1489944440615?w=800',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
  'https://images.unsplash.com/photo-1431324155629?w=800',
  'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=800',
]

const getRandomImage = () => {
  return FOOTBALL_IMAGES[Math.floor(Math.random() * FOOTBALL_IMAGES.length)]
}

// Map prediction type to Chinese label
const TYPE_LABELS: Record<string, string> = {
  MATCH_RESULT: '胜负预测',
  SCORE: '比分预测',
  OVER_UNDER: '大小球预测',
  TOTAL_GOALS: '总进球预测',
}

// Map prediction value to readable text
function formatPrediction(type: string, prediction: string, homeTeam?: string, awayTeam?: string): string {
  switch (type) {
    case 'MATCH_RESULT': {
      if (prediction === 'home_win') return homeTeam ? `${homeTeam} 胜` : '主胜'
      if (prediction === 'away_win') return awayTeam ? `${awayTeam} 胜` : '客胜'
      return '平局'
    }
    case 'SCORE':
      return `比分 ${prediction}`
    case 'OVER_UNDER': {
      const [ou, line] = prediction.split('_')
      return `${ou === 'over' ? '大' : '小'}${line || '2.5'}球`
    }
    case 'TOTAL_GOALS':
      return `总进球 ${prediction} 球`
    default:
      return prediction
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const { matchId, type, prediction, reasoning, homeTeam, awayTeam } = await request.json()

    if (!matchId || !type || !prediction) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: matchId, type, prediction' },
        { status: 400 }
      )
    }

    if (reasoning && reasoning.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Reasoning must be at most 1000 characters' },
        { status: 400 }
      )
    }

    // 48-hour prediction window: can only predict matches within 48h of kickoff
    // Anti oracle-farming: prevents predictions far in advance or after match ends
    const windowCheck = canPredictForMatch(matchId)
    if (!windowCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: windowCheck.reason || 'Cannot predict for this match at this time',
        matchTime: windowCheck.matchTime?.toISOString(),
      }, { status: 400 })
    }

    const validTypes = ['MATCH_RESULT', 'SCORE', 'OVER_UNDER', 'TOTAL_GOALS']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: `Invalid prediction type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await createPrediction(payload.userId, matchId, type as any, prediction, reasoning)

    // Always create a post for the prediction
    const predText = formatPrediction(type, prediction, homeTeam, awayTeam)
    const teamBlock = homeTeam && awayTeam
      ? `${homeTeam} vs ${awayTeam}`
      : ''

    const postContent = reasoning?.trim()
      ? [
          `⚽ 竞猜分析`,
          teamBlock ? `${teamBlock}` : '',
          `📊 我预测: ${predText}`,
          '',
          reasoning.trim(),
        ].filter(Boolean).join('\n')
      : [
          `⚽ 竞猜分析`,
          teamBlock ? `${teamBlock}` : '',
          `📊 我预测: ${predText}`,
        ].filter(Boolean).join('\n')

    try {
      await prisma.post.create({
        data: {
          userId: payload.userId,
          content: postContent,
          imageUrl: getRandomImage(),
        },
      })
    } catch (postErr) {
      console.error('[Prediction] Failed to create post:', postErr)
    }

    return NextResponse.json({ success: true, prediction: result })
  } catch (error) {
    const message = (error as Error).message || 'Failed to create prediction'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
