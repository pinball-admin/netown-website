/**
 * Scheduled Prediction Pipeline
 * 
 * Automated prediction generation and forum publishing system.
 * Runs predictions for all upcoming matches within configurable window.
 * 
 * Supports:
 * - Vercel Cron Jobs (via /api/cron/predictions)
 * - Manual triggering (via API with auth)
 * - Configurable prediction window (default: 48h before match)
 * - Rate limiting and deduplication
 * 
 * Schedule: Every 6 hours for matches in the next 48h window
 */

import { prisma } from '@/libs/prisma/client'
import { initializeEnsemble, predictMatch, type EnsemblePrediction } from './ensemble-engine'
import { predictWithXG, type XGPrediction } from './xg-model'
import { getPreMatchAdjustment, type TeamNewsReport } from './news-scraper'
import { trainGradientBoostingModel, predictWithGradientBoosting, buildMatchFeatures, type MatchFeatures } from './gradient-boosting'
import { fetchMatchSchedule, getMockMatchSchedule } from '@/libs/services/wheniskickoff'
import { getPredictionModel } from './ml-model'
import type { Match } from '@/libs/types'

interface ScheduledMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeTeamId: string
  awayTeamId: string
  utcDate: string
  group: string
  venue: string
  match: Match
}

interface PredictionResult {
  match: ScheduledMatch
  ensemble: EnsemblePrediction | null
  xg: XGPrediction | null
  news: { homeNews: TeamNewsReport; awayNews: TeamNewsReport; newsSummary: string } | null
  gb: ReturnType<typeof predictWithGradientBoosting> | null
  published: boolean
  postId?: string
  error?: string
}

const SYSTEM_USER_EMAIL = 'ai-predictions@netown.com'
const SYSTEM_USER_NAME = 'AI Oracle'
const PREDICTION_WINDOW_HOURS = 48

/**
 * Main pipeline: generate and publish predictions for upcoming matches
 */
export async function runPredictionPipeline(options: {
  limit?: number
  publish?: boolean
  windowHours?: number
} = {}): Promise<{
  processed: number
  published: number
  errors: string[]
  results: PredictionResult[]
}> {
  const { limit = 16, publish = false, windowHours = PREDICTION_WINDOW_HOURS } = options

  console.log(`[Pipeline] Starting prediction pipeline (window: ${windowHours}h, limit: ${limit}, publish: ${publish})`)

  // Step 1: Initialize all models
  console.log('[Pipeline] Step 1: Initializing prediction models...')
  try {
    await initializeEnsemble()
    trainGradientBoostingModel()
    console.log('[Pipeline] All models initialized')
  } catch (err: any) {
    console.error('[Pipeline] Model initialization failed:', err.message)
    return { processed: 0, published: 0, errors: [err.message], results: [] }
  }

  // Step 2: Get upcoming matches
  console.log('[Pipeline] Step 2: Fetching upcoming matches...')
  let allMatches: Match[]
  try {
    allMatches = await fetchMatchSchedule()
  } catch {
    allMatches = getMockMatchSchedule()
  }
  if (allMatches.length === 0) {
    allMatches = getMockMatchSchedule()
  }
  const now = new Date()
  const windowMs = windowHours * 60 * 60 * 1000

  // Convert matches to ScheduledMatch format
  const scheduledMatches: ScheduledMatch[] = allMatches
    .filter(m => m.status === 'scheduled')
    .map(m => ({
      id: m.id,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeTeamId: m.homeTeam.id,
      awayTeamId: m.awayTeam.id,
      utcDate: `${m.date}T${m.time}:00Z`,
      group: m.group,
      venue: m.venue,
      match: m,
    }))

  const upcomingMatches = scheduledMatches.filter(m => {
    const matchDate = new Date(m.utcDate)
    const diff = matchDate.getTime() - now.getTime()
    return diff > 0 && diff <= windowMs
  })

  console.log(`[Pipeline] Found ${upcomingMatches.length} matches within ${windowHours}h window`)

  if (upcomingMatches.length === 0) {
    // If no matches in window, use all scheduled matches
    console.log('[Pipeline] No matches in window, using all scheduled matches')
    upcomingMatches.push(...scheduledMatches.slice(0, limit))
  }

  // Step 3: Get or create system user for forum posts
  let systemUserId: string | null = null
  if (publish) {
    systemUserId = await getOrCreateSystemUser()
    if (!systemUserId) {
      console.warn('[Pipeline] Could not get system user, skipping publish')
    }
  }

  // Step 4: Generate predictions for each match
  console.log('[Pipeline] Step 3: Generating multi-model predictions...')
  const results: PredictionResult[] = []
  const errors: string[] = []
  let publishedCount = 0

  for (const match of upcomingMatches.slice(0, limit)) {
    try {
      const result = await processMatch(match, systemUserId, publish)
      results.push(result)
      if (result.published) publishedCount++
      if (result.error) errors.push(result.error)
    } catch (err: any) {
      errors.push(`${match.homeTeam} vs ${match.awayTeam}: ${err.message}`)
      results.push({
        match,
        ensemble: null,
        xg: null,
        news: null,
        gb: null,
        published: false,
        error: err.message,
      })
    }
  }

  console.log(`[Pipeline] Completed: ${results.length} processed, ${publishedCount} published, ${errors.length} errors`)

  return {
    processed: results.length,
    published: publishedCount,
    errors,
    results,
  }
}

/**
 * Process a single match through all prediction models
 */
async function processMatch(
  match: ScheduledMatch,
  systemUserId: string | null,
  publish: boolean
): Promise<PredictionResult> {
  const result: PredictionResult = {
    match,
    ensemble: null,
    xg: null,
    news: null,
    gb: null,
    published: false,
  }

  // 1. Ensemble prediction (Dixon-Coles + ELO + Form + H2H)
  try {
    result.ensemble = predictMatch(match.match)
  } catch (err: any) {
    console.warn(`[Pipeline] Ensemble failed for ${match.homeTeam} vs ${match.awayTeam}:`, err.message)
  }

  // 2. xG Model prediction
  try {
    result.xg = predictWithXG(match.homeTeamId, match.awayTeamId, true)
  } catch (err: any) {
    console.warn(`[Pipeline] xG failed for ${match.homeTeam} vs ${match.awayTeam}:`, err.message)
  }

  // 3. News/Injury impact
  try {
    result.news = getPreMatchAdjustment(match.homeTeamId, match.awayTeamId)
  } catch (err: any) {
    console.warn(`[Pipeline] News failed for ${match.homeTeam} vs ${match.awayTeam}:`, err.message)
  }

  // 4. Gradient Boosting prediction
  try {
    const eloModel = getPredictionModel()
    const eloData = (eloModel as any).teamElos as Map<string, { elo: number }>
    const homeElo = eloData?.get(match.homeTeamId)?.elo || 1600
    const awayElo = eloData?.get(match.awayTeamId)?.elo || 1600

    const features: MatchFeatures = buildMatchFeatures({
      homeElo,
      awayElo,
      homeXG: result.xg?.homeXG || 1.3,
      awayXG: result.xg?.awayXG || 1.3,
      homeFormGoals: result.xg?.homeXG || 1.3,
      awayFormGoals: result.xg?.awayXG || 1.3,
      homeFormConceded: result.news?.homeNews ? (2 - result.news.homeNews.defensiveModifier) : 1.0,
      awayFormConceded: result.news?.awayNews ? (2 - result.news.awayNews.defensiveModifier) : 1.0,
      homePossession: result.xg?.homeXG ? (result.xg.homeXG / 3 * 100) : 50,
      awayPossession: result.xg?.awayXG ? (result.xg.awayXG / 3 * 100) : 50,
      homeShotQuality: 0.34,
      awayShotQuality: 0.34,
      isNeutral: true,
      h2hHomeWinRate: 0.5,
      homeRestDays: result.news?.homeNews?.restDays || 4,
      awayRestDays: result.news?.awayNews?.restDays || 4,
      homeMorale: result.news?.homeNews?.teamMorale === 'high' ? 0.3 : result.news?.homeNews?.teamMorale === 'low' ? -0.3 : 0,
      awayMorale: result.news?.awayNews?.teamMorale === 'high' ? 0.3 : result.news?.awayNews?.teamMorale === 'low' ? -0.3 : 0,
    })

    result.gb = predictWithGradientBoosting(features)
  } catch (err: any) {
    console.warn(`[Pipeline] GBDT failed for ${match.homeTeam} vs ${match.awayTeam}:`, err.message)
  }

  // 5. Publish to forum
  if (publish && systemUserId && result.ensemble) {
    try {
      const postId = await publishToForum(match, result, systemUserId)
      result.published = true
      result.postId = postId
    } catch (err: any) {
      console.warn(`[Pipeline] Publish failed for ${match.homeTeam} vs ${match.awayTeam}:`, err.message)
      result.error = `Publish: ${err.message}`
    }
  }

  return result
}

/**
 * Publish prediction analysis to forum
 */
async function publishToForum(
  match: ScheduledMatch,
  result: PredictionResult,
  systemUserId: string
): Promise<string> {
  const ensemble = result.ensemble!
  const matchDate = new Date(match.utcDate)

  // Check if post already exists for this match
  const existing = await prisma.post.findFirst({
    where: {
      userId: systemUserId,
      content: { contains: `${match.homeTeam} vs ${match.awayTeam}` },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (existing) {
    console.log(`[Pipeline] Post already exists for ${match.homeTeam} vs ${match.awayTeam}, skipping`)
    return existing.id
  }

  // Build comprehensive analysis text
  let content = `## Multi-Model AI Prediction Analysis\n\n`
  content += `**${match.homeTeam} vs ${match.awayTeam}**\n`
  content += `**Date:** ${matchDate.toLocaleString('en-US', { timeZone: 'UTC' })}\n`
  content += `**Group:** ${match.group} | **Venue:** ${match.venue}\n\n`

  const modelCount = Object.keys(ensemble.models).length
  content += `### Ensemble Prediction (${modelCount} models)\n`
  content += `- **Home Win:** ${ensemble.homeWinProb.toFixed(1)}%\n`
  content += `- **Draw:** ${ensemble.drawProb.toFixed(1)}%\n`
  content += `- **Away Win:** ${ensemble.awayWinProb.toFixed(1)}%\n`
  content += `- **Predicted Score:** ${ensemble.predictedScore.home} - ${ensemble.predictedScore.away}\n`
  content += `- **Confidence:** ${ensemble.confidence}%\n\n`

  if (result.xg) {
    content += `### xG Analysis\n`
    content += `- **${match.homeTeam} xG:** ${result.xg.homeXG.toFixed(2)} | **${match.awayTeam} xG:** ${result.xg.awayXG.toFixed(2)}\n`
    content += `- **Expected Goals:** ${result.xg.expectedHomeGoals} - ${result.xg.expectedAwayGoals}\n`
    content += `- **Over 2.5:** ${result.xg.over25Prob.toFixed(1)}% | **BTTS:** ${result.xg.bttsProb.toFixed(1)}%\n`
    content += `- **Insight:** ${result.xg.keyInsight}\n\n`
  }

  if (result.news) {
    content += `### Pre-Match News Impact\n`
    content += `- **News:** ${result.news.newsSummary}\n`
    content += `- **${match.homeTeam} Attack Modifier:** ${((result.news.homeNews.offensiveModifier - 1) * 100).toFixed(1)}%\n`
    content += `- **${match.awayTeam} Attack Modifier:** ${((result.news.awayNews.offensiveModifier - 1) * 100).toFixed(1)}%\n\n`
  }

  if (result.gb) {
    content += `### Gradient Boosting ML\n`
    content += `- **GBDT Prediction:** ${result.gb.predictedHomeGoals} - ${result.gb.predictedAwayGoals}\n`
    content += `- **ML Confidence:** ${result.gb.confidence}%\n`
    content += `- **Top Feature:** ${result.gb.featureImportance[0]?.feature} (${result.gb.featureImportance[0]?.importance}%)\n\n`
  }

  content += `### Expert Panel\n`
  if (ensemble.experts) {
    for (const expert of ensemble.experts) {
      const pick = expert.homeWinProb > expert.drawProb && expert.homeWinProb > expert.awayWinProb
        ? match.homeTeam
        : expert.drawProb > expert.awayWinProb
        ? 'Draw'
        : match.awayTeam
      content += `- **${expert.expertId}:** ${pick} (${expert.confidence}%) — ${expert.reasoning}\n`
    }
  }

  content += `\n---\n*Generated by AI Oracle • ${new Date().toISOString().split('T')[0]}*\n`
  content += `*Models: Dixon-Coles + ELO + xG + GBDT + News Analysis*\n`
  content += `*⚠️ For entertainment purposes only. Not financial advice.*`

  const post = await prisma.post.create({
    data: {
      content,
      userId: systemUserId,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    },
  })

  return post.id
}

/**
 * Get or create the system user for automated posts
 */
async function getOrCreateSystemUser(): Promise<string | null> {
  try {
    let user = await prisma.user.findFirst({
      where: { email: SYSTEM_USER_EMAIL },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: SYSTEM_USER_EMAIL,
          name: SYSTEM_USER_NAME,
          region: 'GLOBAL',
          role: 'SYSTEM',
          isVerified: true,
        },
      })
      console.log('[Pipeline] Created system user:', SYSTEM_USER_NAME)
    }

    return user.id
  } catch (err: any) {
    console.error('[Pipeline] Failed to get system user:', err.message)
    return null
  }
}

/**
 * Get prediction statistics for dashboard
 */
export function getModelStats(): {
  models: { name: string; type: string; status: string; weight: number }[]
  totalFeatures: number
  lastUpdated: string
} {
  return {
    models: [
      { name: 'Dixon-Coles', type: 'Poisson Regression', status: 'active', weight: 0.30 },
      { name: 'Enhanced ELO', type: 'Rating System', status: 'active', weight: 0.20 },
      { name: 'xG Model', type: 'Expected Goals', status: 'active', weight: 0.20 },
      { name: 'Gradient Boosting', type: 'Machine Learning', status: 'active', weight: 0.15 },
      { name: 'News/Injury', type: 'Pre-Match Adjustment', status: 'active', weight: 0.10 },
      { name: 'Form Analysis', type: 'Recent Performance', status: 'active', weight: 0.03 },
      { name: 'Head-to-Head', type: 'Historical', status: 'active', weight: 0.02 },
    ],
    totalFeatures: 45,
    lastUpdated: new Date().toISOString(),
  }
}
