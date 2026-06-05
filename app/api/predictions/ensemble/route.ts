import { NextResponse } from 'next/server'
import { fetchMatchSchedule, getUpcomingMatches, getMockMatchSchedule } from '@/libs/services/wheniskickoff'
import { initializeEnsemble, predictMatch, EnsemblePrediction } from '@/libs/prediction/ensemble-engine'
import { Match } from '@/libs/types'

export const dynamic = 'force-dynamic'

/**
 * Ensemble Prediction API
 * 
 * Uses real prediction models:
 * - Dixon-Coles (Poisson regression with draw correction)
 * - Enhanced ELO (updated from historical match data)
 * - Form-based adjustment
 * - Head-to-head historical factor
 * 
 * GET /api/predictions/ensemble?limit=8&group=A&publish=true
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')
    const group = searchParams.get('group') || ''
    const publish = searchParams.get('publish') === 'true'

    // Initialize ensemble with historical data (cached)
    await initializeEnsemble()

    // Fetch match schedule
    let matches: Match[]
    try {
      matches = await fetchMatchSchedule()
    } catch {
      matches = getMockMatchSchedule()
    }

    if (matches.length === 0) {
      return NextResponse.json({ success: false, error: 'No matches found' }, { status: 404 })
    }

    // Filter by group if specified
    if (group) {
      matches = matches.filter(m => m.group.toLowerCase().includes(group.toLowerCase()))
    }

    // Get upcoming matches
    const upcoming = getUpcomingMatches(matches, limit)
    const targetMatches = upcoming.length > 0 ? upcoming : matches.slice(0, limit)

    // Generate ensemble predictions
    const predictions: EnsemblePrediction[] = targetMatches.map(match => predictMatch(match))

    // If publish=true, auto-post top predictions to forum
    let publishedPosts: any[] = []
    if (publish) {
      publishedPosts = await autoPublishToForum(predictions)
    }

    return NextResponse.json({
      success: true,
      total: predictions.length,
      predictions,
      published: publishedPosts.length,
      publishedPosts,
      models: ['Dixon-Coles', 'Enhanced ELO', 'Form Analysis', 'Head-to-Head'],
      weights: { dixonColes: 0.45, elo: 0.30, form: 0.15, h2h: 0.10 },
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Ensemble prediction error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate predictions'
    }, { status: 500 })
  }
}

/**
 * Auto-publish predictions to forum
 * Posts predictions for matches starting within 48 hours
 */
async function autoPublishToForum(predictions: EnsemblePrediction[]): Promise<any[]> {
  const published: any[] = []
  const now = new Date()
  const fortyEightHours = 48 * 60 * 60 * 1000

  for (const pred of predictions) {
    // Check if match is within 48 hours
    const matchDate = new Date(pred.date)
    const hoursUntilMatch = matchDate.getTime() - now.getTime()

    if (hoursUntilMatch > 0 && hoursUntilMatch <= fortyEightHours) {
      try {
        // Create forum post via direct Prisma (bypass auth for system posts)
        const { prisma } = await import('@/libs/prisma/client')

        // Find or create system user for AI predictions
        let systemUser = await prisma.user.findFirst({
          where: { email: 'ai-predictions@netown.com' }
        })

        if (!systemUser) {
          systemUser = await prisma.user.create({
            data: {
              email: 'ai-predictions@netown.com',
              name: 'AI Oracle',
              region: 'GLOBAL',
              role: 'SYSTEM',
              isVerified: true,
            }
          })
        }

        const post = await prisma.post.create({
          data: {
            userId: systemUser.id,
            content: pred.analysis,
            imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
          },
        })

        published.push({
          postId: post.id,
          match: `${pred.homeTeam} vs ${pred.awayTeam}`,
          prediction: `${pred.consensusWinner} ${pred.predictedScore.home}-${pred.predictedScore.away}`,
          confidence: pred.confidence,
        })
      } catch (err) {
        console.warn(`[AutoPublish] Failed for ${pred.homeTeam} vs ${pred.awayTeam}:`, err)
      }
    }
  }

  return published
}
