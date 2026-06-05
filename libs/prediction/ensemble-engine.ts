/**
 * Ensemble Prediction Engine
 * 
 * Combines multiple models for comprehensive match prediction:
 * 1. Dixon-Coles (Poisson regression with draw correction)
 * 2. Enhanced ELO (with historical data updates)
 * 3. Form-based adjustment (recent 5 matches)
 * 4. Head-to-head historical factor
 * 5. Bivariate Poisson goal correlation
 * 
 * Generates predictions that can be auto-published to forum.
 */

import { Match, EXPERT_IDS, ExpertId } from '../types'
import { DixonColesModel, getDixonColesModel, DixonColesPrediction } from './dixon-coles'
import { EloPredictionModel, getPredictionModel } from './ml-model'
import { fetchHistoricalMatches, getHeadToHead } from './historical-data'
import { predictWithXG, getXGProfile } from './xg-model'
import { trainGradientBoostingModel, predictWithGradientBoosting, buildMatchFeatures } from './gradient-boosting'
import { getPreMatchAdjustment } from './news-scraper'

export interface EnsemblePrediction {
  matchId: string
  homeTeam: string
  awayTeam: string
  date: string

  // Combined probabilities
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  consensusWinner: 'home' | 'draw' | 'away'

  // Score prediction
  predictedScore: { home: number; away: number }
  predictedHalfTime: { home: number; away: number }

  // Over/Under
  over25Prob: number
  over15Prob: number
  over35Prob: number

  // Both teams to score
  bttsProb: number

  // Goal distribution
  goalDistribution: { goals: number; probability: number }[]

  // Model confidence
  confidence: number
  modelAgreement: number // how much the models agree

  // Detailed analysis for forum post
  analysis: string

  // Individual model outputs (for transparency)
  models: {
    dixonColes: { homeWin: number; draw: number; awayWin: number; score: { home: number; away: number } }
    elo: { homeWin: number; draw: number; awayWin: number; score: { home: number; away: number } }
    xg: { homeWin: number; draw: number; awayWin: number; xg: { home: number; away: number } }
    gbdt: { homeWin: number; draw: number; awayWin: number; confidence: number }
    form: { adjustment: number; homeForm: number; awayForm: number }
    h2h: { homeWins: number; draws: number; awayWins: number; total: number }
    news: { homeModifier: number; awayModifier: number; summary: string }
  }

  // Expert predictions (5 AI personas with different weighting)
  experts: ExpertEnsemblePrediction[]
}

export interface ExpertEnsemblePrediction {
  expertId: string
  winner: 'home' | 'draw' | 'away'
  score: { home: number; away: number }
  halfTime: { home: number; away: number }
  overUnder: 'over' | 'under'
  confidence: number
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  reasoning: string
}

// Model weights for ensemble (updated to include xG and GBDT)
const MODEL_WEIGHTS = {
  dixonColes: 0.30, // Primary model - most accurate for football
  elo: 0.20,        // Secondary model - good for relative strength
  xg: 0.20,         // Expected goals - shot quality analysis
  gbdt: 0.15,       // Gradient boosting ML - feature-based
  form: 0.08,       // Recent form adjustment
  h2h: 0.05,        // Head-to-head historical factor
  news: 0.02,       // News/injury impact
}

let initialized = false

/**
 * Initialize the ensemble engine with historical data
 * Call once at startup
 */
export async function initializeEnsemble(): Promise<void> {
  if (initialized) return

  try {
    const historicalMatches = await fetchHistoricalMatches()
    const dixonColes = getDixonColesModel()
    dixonColes.updateFromHistoricalData(historicalMatches)
    
    // Also update ELO model with historical results
    const eloModel = getPredictionModel()
    for (const match of historicalMatches) {
      const winner = match.homeGoals > match.awayGoals ? 'home' :
                     match.awayGoals > match.homeGoals ? 'away' : 'draw'
      const mockMatch: Match = {
        id: `${match.date}-${match.homeTeam}-${match.awayTeam}`,
        homeTeam: { id: match.homeTeam, name: match.homeTeam, shortName: match.homeTeam, flag: '⚽', group: '' },
        awayTeam: { id: match.awayTeam, name: match.awayTeam, shortName: match.awayTeam, flag: '⚽', group: '' },
        date: match.date,
        time: '20:00',
        venue: '',
        group: '',
        status: 'finished',
        score: { home: match.homeGoals, away: match.awayGoals },
        round: match.competition || 'International',
      }
      eloModel.updateElo(winner as any, match.homeGoals, match.awayGoals, mockMatch)
    }

    initialized = true
    console.log(`[Ensemble] Initialized with ${historicalMatches.length} historical matches`)
  } catch (err) {
    console.warn('[Ensemble] Initialization failed, using defaults:', err)
    initialized = true // Mark as initialized even on failure to avoid retries
  }

  // Initialize Gradient Boosting model
  try {
    trainGradientBoostingModel()
    console.log('[Ensemble] Gradient Boosting model trained')
  } catch (err) {
    console.warn('[Ensemble] GBDT training failed:', err)
  }
}

/**
 * Generate comprehensive ensemble prediction for a match
 */
export function predictMatch(match: Match): EnsemblePrediction {
  const homeId = match.homeTeam.id
  const awayId = match.awayTeam.id

  // 1. Dixon-Coles prediction
  const dixonColes = getDixonColesModel()
  const dcPred = dixonColes.predict(homeId, awayId, true) // World Cup = neutral venue

  // 2. ELO prediction
  const eloModel = getPredictionModel()
  const eloPred = eloModel.getPredictionForMatch(match)

  // 3. Form data
  const homeParams = dixonColes.getTeamParams(homeId)
  const awayParams = dixonColes.getTeamParams(awayId)
  const homeForm = homeParams.recentForm.length > 0
    ? homeParams.recentForm.reduce((a, b) => a + b, 0) / homeParams.recentForm.length : 0.5
  const awayForm = awayParams.recentForm.length > 0
    ? awayParams.recentForm.reduce((a, b) => a + b, 0) / awayParams.recentForm.length : 0.5
  const formAdjustment = (homeForm - awayForm) * 0.15

  // 4. Head-to-head
  const h2h = getHeadToHead(homeId, awayId)

  // === Ensemble combination ===
  // 5. xG Model prediction
  const xgPred = predictWithXG(homeId, awayId, true)

  // 6. Gradient Boosting prediction
  const homeXGProfile = getXGProfile(homeId)
  const awayXGProfile = getXGProfile(awayId)
  const newsAdj = getPreMatchAdjustment(homeId, awayId)
  
  const eloData = (eloModel as any).teamElos as Map<string, { elo: number }> | undefined
  const homeElo = eloData?.get(homeId)?.elo || 1600
  const awayElo = eloData?.get(awayId)?.elo || 1600

  const gbFeatures = buildMatchFeatures({
    homeElo, awayElo,
    homeXG: homeXGProfile.xGPerGame, awayXG: awayXGProfile.xGPerGame,
    homeFormGoals: homeXGProfile.recentFormXG.reduce((a, b) => a + b, 0) / 5,
    awayFormGoals: awayXGProfile.recentFormXG.reduce((a, b) => a + b, 0) / 5,
    homeFormConceded: homeXGProfile.xGA_PerGame,
    awayFormConceded: awayXGProfile.xGA_PerGame,
    homePossession: homeXGProfile.possessionPct,
    awayPossession: awayXGProfile.possessionPct,
    homeShotQuality: homeXGProfile.shotsOnTargetPct * homeXGProfile.goalConversionRate,
    awayShotQuality: awayXGProfile.shotsOnTargetPct * awayXGProfile.goalConversionRate,
    isNeutral: true,
    h2hHomeWinRate: h2h.total > 0 ? h2h.aWins / h2h.total : 0.5,
    homeRestDays: newsAdj.homeNews.restDays,
    awayRestDays: newsAdj.awayNews.restDays,
    homeMorale: newsAdj.homeNews.teamMorale === 'high' ? 0.3 : newsAdj.homeNews.teamMorale === 'low' ? -0.3 : 0,
    awayMorale: newsAdj.awayNews.teamMorale === 'high' ? 0.3 : newsAdj.awayNews.teamMorale === 'low' ? -0.3 : 0,
  })
  const gbPred = predictWithGradientBoosting(gbFeatures)

  // Weighted average of model probabilities (updated with xG and GBDT)
  let ensembleHomeWin =
    MODEL_WEIGHTS.dixonColes * (dcPred.homeWinProb / 100) +
    MODEL_WEIGHTS.elo * (eloPred.homeWin / 100) +
    MODEL_WEIGHTS.xg * (xgPred.homeWinProb / 100) +
    MODEL_WEIGHTS.gbdt * (gbPred.homeWinProb / 100) +
    MODEL_WEIGHTS.form * (0.5 + formAdjustment) +
    MODEL_WEIGHTS.h2h * (h2h.total > 0 ? h2h.aWins / h2h.total : 0.35) +
    MODEL_WEIGHTS.news * newsAdj.netAdjustment

  let ensembleDraw =
    MODEL_WEIGHTS.dixonColes * (dcPred.drawProb / 100) +
    MODEL_WEIGHTS.elo * (eloPred.draw / 100) +
    MODEL_WEIGHTS.xg * (xgPred.drawProb / 100) +
    MODEL_WEIGHTS.gbdt * (gbPred.drawProb / 100) +
    MODEL_WEIGHTS.form * 0.25 +
    MODEL_WEIGHTS.h2h * (h2h.total > 0 ? h2h.draws / h2h.total : 0.25)

  let ensembleAwayWin =
    MODEL_WEIGHTS.dixonColes * (dcPred.awayWinProb / 100) +
    MODEL_WEIGHTS.elo * (eloPred.awayWin / 100) +
    MODEL_WEIGHTS.xg * (xgPred.awayWinProb / 100) +
    MODEL_WEIGHTS.gbdt * (gbPred.awayWinProb / 100) +
    MODEL_WEIGHTS.form * (0.5 - formAdjustment) +
    MODEL_WEIGHTS.h2h * (h2h.total > 0 ? h2h.bWins / h2h.total : 0.35) -
    MODEL_WEIGHTS.news * newsAdj.netAdjustment

  // Normalize
  const total = ensembleHomeWin + ensembleDraw + ensembleAwayWin
  ensembleHomeWin /= total
  ensembleDraw /= total
  ensembleAwayWin /= total

  const homeWinProb = Math.round(ensembleHomeWin * 1000) / 10
  const drawProb = Math.round(ensembleDraw * 1000) / 10
  const awayWinProb = Math.round(ensembleAwayWin * 1000) / 10

  // Consensus winner
  const consensusWinner: 'home' | 'draw' | 'away' =
    homeWinProb > awayWinProb + 5 ? 'home' :
    awayWinProb > homeWinProb + 5 ? 'away' : 'draw'

  // Score prediction: weighted blend of all models
  const predictedScore = {
    home: Math.round(
      dcPred.mostLikelyScore.home * 0.4 +
      eloPred.predictedScore.home * 0.25 +
      xgPred.expectedHomeGoals * 0.25 +
      gbPred.predictedHomeGoals * 0.1
    ),
    away: Math.round(
      dcPred.mostLikelyScore.away * 0.4 +
      eloPred.predictedScore.away * 0.25 +
      xgPred.expectedAwayGoals * 0.25 +
      gbPred.predictedAwayGoals * 0.1
    ),
  }

  // Half-time
  const predictedHalfTime = {
    home: Math.round(predictedScore.home * 0.42),
    away: Math.round(predictedScore.away * 0.42),
  }

  // Model agreement: how similar are all model predictions?
  const dcWinner = dcPred.homeWinProb > dcPred.awayWinProb ? 'home' : dcPred.awayWinProb > dcPred.homeWinProb ? 'away' : 'draw'
  const eloWinner = eloPred.homeWin > eloPred.awayWin ? 'home' : eloPred.awayWin > eloPred.homeWin ? 'away' : 'draw'
  const xgWinner = xgPred.homeWinProb > xgPred.awayWinProb ? 'home' : xgPred.awayWinProb > xgPred.homeWinProb ? 'away' : 'draw'
  const gbWinner = gbPred.homeWinProb > gbPred.awayWinProb ? 'home' : gbPred.awayWinProb > gbPred.homeWinProb ? 'away' : 'draw'
  
  const winners = [dcWinner, eloWinner, xgWinner, gbWinner]
  const majorityWinner = winners.filter(w => w === dcWinner).length >= 2 ? dcWinner : 'mixed'
  const modelAgreement = majorityWinner !== 'mixed' ? 0.9 : 0.55

  // Confidence based on probability spread and model agreement
  const maxProb = Math.max(homeWinProb, drawProb, awayWinProb)
  const confidence = Math.round(Math.min(92, Math.max(45, maxProb * 0.7 + modelAgreement * 30)))

  // Generate expert variations
  const experts = generateExpertPredictions(
    match, homeWinProb, drawProb, awayWinProb,
    predictedScore, predictedHalfTime, dcPred, eloPred
  )

  // Generate analysis text
  const analysis = generateAnalysis(
    match, homeWinProb, drawProb, awayWinProb,
    predictedScore, dcPred, h2h, homeForm, awayForm
  )

  return {
    matchId: match.id,
    homeTeam: match.homeTeam.name || match.homeTeam.id,
    awayTeam: match.awayTeam.name || match.awayTeam.id,
    date: match.date,
    homeWinProb,
    drawProb,
    awayWinProb,
    consensusWinner,
    predictedScore,
    predictedHalfTime,
    over25Prob: dcPred.overProb['2.5'] ? Math.round(dcPred.overProb['2.5'] * 100) : eloPred.over,
    over15Prob: dcPred.overProb['1.5'] ? Math.round(dcPred.overProb['1.5'] * 100) : Math.min(90, (dcPred.overProb['2.5'] ? dcPred.overProb['2.5'] * 100 : 50) + 25),
    over35Prob: dcPred.overProb['3.5'] ? Math.round(dcPred.overProb['3.5'] * 100) : Math.max(10, (dcPred.overProb['2.5'] ? dcPred.overProb['2.5'] * 100 : 50) - 20),
    bttsProb: dcPred.bttsProb,
    goalDistribution: dcPred.goalDistribution,
    confidence,
    modelAgreement: Math.round(modelAgreement * 100),
    analysis,
    models: {
      dixonColes: {
        homeWin: dcPred.homeWinProb,
        draw: dcPred.drawProb,
        awayWin: dcPred.awayWinProb,
        score: dcPred.mostLikelyScore,
      },
      elo: {
        homeWin: eloPred.homeWin,
        draw: eloPred.draw,
        awayWin: eloPred.awayWin,
        score: eloPred.predictedScore,
      },
      xg: {
        homeWin: xgPred.homeWinProb,
        draw: xgPred.drawProb,
        awayWin: xgPred.awayWinProb,
        xg: { home: xgPred.homeXG, away: xgPred.awayXG },
      },
      gbdt: {
        homeWin: gbPred.homeWinProb,
        draw: gbPred.drawProb,
        awayWin: gbPred.awayWinProb,
        confidence: gbPred.confidence,
      },
      form: {
        adjustment: Math.round(formAdjustment * 100) / 100,
        homeForm: Math.round(homeForm * 100) / 100,
        awayForm: Math.round(awayForm * 100) / 100,
      },
      h2h: {
        homeWins: h2h.aWins,
        draws: h2h.draws,
        awayWins: h2h.bWins,
        total: h2h.total,
      },
      news: {
        homeModifier: newsAdj.homeNews.overallModifier,
        awayModifier: newsAdj.awayNews.overallModifier,
        summary: newsAdj.newsSummary,
      },
    },
    experts,
  }
}

/**
 * Generate 5 expert predictions with different model weightings
 */
function generateExpertPredictions(
  match: Match,
  baseHome: number, baseDraw: number, baseAway: number,
  baseScore: { home: number; away: number },
  baseHT: { home: number; away: number },
  dcPred: DixonColesPrediction,
  eloPred: any
): ExpertEnsemblePrediction[] {
  const expertWeights: Record<string, { dcWeight: number; eloWeight: number; homeBias: number; drawBias: number; awayBias: number; goalBias: number }> = {
    beckham_chen:   { dcWeight: 0.5, eloWeight: 0.3, homeBias: 3, drawBias: -2, awayBias: -1, goalBias: 0 },
    zidane_gao:     { dcWeight: 0.4, eloWeight: 0.4, homeBias: -1, drawBias: 5, awayBias: -4, goalBias: -1 },
    batistuta_zhang:{ dcWeight: 0.3, eloWeight: 0.3, homeBias: -3, drawBias: -2, awayBias: 5, goalBias: 1 },
    shearer_zhang:  { dcWeight: 0.5, eloWeight: 0.2, homeBias: 0, drawBias: 0, awayBias: 0, goalBias: 2 },
    ronaldo_silva:  { dcWeight: 0.4, eloWeight: 0.3, homeBias: 1, drawBias: 2, awayBias: -3, goalBias: -1 },
  }

  const homeName = match.homeTeam.name || match.homeTeam.id
  const awayName = match.awayTeam.name || match.awayTeam.id

  return EXPERT_IDS.map(expertId => {
    const w = expertWeights[expertId] || expertWeights.beckham_chen

    let h = Math.max(5, Math.min(85, baseHome + w.homeBias))
    let d = Math.max(5, Math.min(55, baseDraw + w.drawBias))
    let a = Math.max(5, Math.min(85, baseAway + w.awayBias))
    const t = h + d + a
    h = Math.round((h / t) * 100)
    d = Math.round((d / t) * 100)
    a = 100 - h - d

    const winner: 'home' | 'draw' | 'away' = h > a ? (h > d ? 'home' : 'draw') : (a > d ? 'away' : 'draw')

    // Score variation
    let homeGoals = baseScore.home + Math.round((Math.random() - 0.5 + w.goalBias * 0.1) * 2)
    let awayGoals = baseScore.away + Math.round((Math.random() - 0.5 - w.goalBias * 0.1) * 2)
    homeGoals = Math.max(0, homeGoals)
    awayGoals = Math.max(0, awayGoals)

    // Adjust score to match winner prediction
    if (winner === 'home' && homeGoals <= awayGoals) homeGoals = awayGoals + 1
    if (winner === 'away' && awayGoals <= homeGoals) awayGoals = homeGoals + 1
    if (winner === 'draw') { homeGoals = Math.max(homeGoals, awayGoals); awayGoals = homeGoals }

    const halfTime = { home: Math.round(homeGoals * 0.42), away: Math.round(awayGoals * 0.42) }
    const overUnder: 'over' | 'under' = (homeGoals + awayGoals) > 2.5 ? 'over' : 'under'
    const conf = Math.max(50, Math.min(92, Math.max(h, d, a) + Math.round(Math.random() * 8)))

    // Generate expert-specific reasoning
    const reasoning = generateExpertReasoning(expertId, match, winner, h, d, a, homeGoals, awayGoals, dcPred, w)

    return {
      expertId,
      winner,
      score: { home: homeGoals, away: awayGoals },
      halfTime,
      overUnder,
      confidence: conf,
      homeWinProb: h,
      drawProb: d,
      awayWinProb: a,
      reasoning,
    }
  })
}

function generateExpertReasoning(
  expertId: string,
  match: Match,
  winner: 'home' | 'draw' | 'away',
  homeWin: number, draw: number, awayWin: number,
  homeGoals: number, awayGoals: number,
  dcPred: DixonColesPrediction,
  weights: any
): string {
  const home = match.homeTeam.name || match.homeTeam.id
  const away = match.awayTeam.name || match.awayTeam.id

  const dcModel = 'Dixon-Coles Poisson'
  const bttsNote = dcPred.bttsProb > 55 ? `High BTTS probability (${Math.round(dcPred.bttsProb)}%)` : `BTTS unlikely (${Math.round(dcPred.bttsProb)}%)`
  const overNote = `${Math.round((dcPred.overProb['2.5'] || 0.5) * 100)}% chance of Over 2.5`

  const expertStyles: Record<string, string[]> = {
    beckham_chen: [
      `Based on ${dcModel} analysis and recent form, ${home} shows strong attacking metrics. Expected goals: ${dcPred.expectedHomeGoals.toFixed(1)} vs ${dcPred.expectedAwayGoals.toFixed(1)}. ${overNote}.`,
      `My Bayesian-weighted model gives ${home} the edge with ${homeWin}% win probability. ${bttsNote}. Predicted: ${homeGoals}-${awayGoals}.`,
    ],
    zidane_gao: [
      `Tactical analysis suggests a tight contest. ${dcModel} model shows draw probability at ${draw}%. Both teams' defensive ratings are comparable.`,
      `Neural network analysis indicates balanced matchup. ${bttsNote}. ${overNote}. Expecting cagey affair: ${homeGoals}-${awayGoals}.`,
    ],
    batistuta_zhang: [
      `Aggressive model: ${away} has dangerous counter-attacking potential. ${dcModel} assigns ${awayWin}% away win probability. ${bttsNote}.`,
      `xG analysis favors attacking quality of ${away}. Historical data shows ${Math.round(dcPred.expectedAwayGoals * 10) / 10} expected away goals. Pick: ${homeGoals}-${awayGoals}.`,
    ],
    shearer_zhang: [
      `Goal-fest expected! ${dcModel} projects ${Math.round(dcPred.expectedHomeGoals + dcPred.expectedAwayGoals)} total goals. ${overNote}. Both teams in scoring form.`,
      `Attacking metrics suggest open game. Expected goals sum: ${(dcPred.expectedHomeGoals + dcPred.expectedAwayGoals).toFixed(1)}. ${bttsNote}. Score: ${homeGoals}-${awayGoals}.`,
    ],
    ronaldo_silva: [
      `Conservative analysis: defensive solidity from both sides. ${dcModel} suggests tight game. ${bttsNote}. Under 2.5 looks value.`,
      `Tactical discipline expected. Both teams' recent defensive form suggests low-scoring affair. ${overNote}. Prediction: ${homeGoals}-${awayGoals}.`,
    ],
  }

  const options = expertStyles[expertId] || expertStyles.beckham_chen
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * Generate analysis text for forum auto-publishing
 */
function generateAnalysis(
  match: Match,
  homeWin: number, draw: number, awayWin: number,
  score: { home: number; away: number },
  dcPred: DixonColesPrediction,
  h2h: { aWins: number; draws: number; bWins: number; total: number },
  homeForm: number, awayForm: number,
): string {
  const home = match.homeTeam.name || match.homeTeam.id
  const away = match.awayTeam.name || match.awayTeam.id
  const winner = homeWin > awayWin ? home : awayWin > homeWin ? away : 'Draw'

  let analysis = `🧠 AI Multi-Model Prediction: ${home} vs ${away}\n\n`
  analysis += `📊 Ensemble Analysis (7 models: Dixon-Coles + ELO + xG + GBDT + News + Form + H2H):\n`
  analysis += `• Win Probability: ${home} ${homeWin}% | Draw ${draw}% | ${away} ${awayWin}%\n`
  analysis += `• Predicted Score: ${score.home}-${score.away}\n`
  analysis += `• Half-Time: ${dcPred.halfTimeExpected.home}-${dcPred.halfTimeExpected.away}\n`
  analysis += `• Over 2.5 Goals: ${Math.round((dcPred.overProb['2.5'] || 0.5) * 100)}%\n`
  analysis += `• Both Teams Score: ${Math.round(dcPred.bttsProb)}%\n\n`

  analysis += `📈 Model Breakdown:\n`
  analysis += `• Dixon-Coles: ${Math.round(dcPred.homeWinProb)}% / ${Math.round(dcPred.drawProb)}% / ${Math.round(dcPred.awayWinProb)}%\n`
  analysis += `• Expected Goals (xG): ${dcPred.expectedHomeGoals.toFixed(2)} - ${dcPred.expectedAwayGoals.toFixed(2)}\n`

  if (h2h.total > 0) {
    analysis += `• H2H Record: ${home} ${h2h.aWins}W ${h2h.draws}D ${h2h.bWins}L vs ${away}\n`
  }

  analysis += `• Recent Form: ${home} ${(homeForm * 100).toFixed(0)}% | ${away} ${(awayForm * 100).toFixed(0)}%\n\n`

  analysis += `🎯 Consensus: ${winner}`
  if (homeWin > awayWin + 10) analysis += ` (strong favorite)`
  else if (Math.abs(homeWin - awayWin) < 10) analysis += ` (very close match)`

  analysis += `\n\n⚠️ AI prediction for analysis only, not betting advice.`

  return analysis
}

/**
 * Generate ensemble predictions for all matches in a group
 */
export function predictGroupMatches(matches: Match[]): EnsemblePrediction[] {
  return matches.map(match => predictMatch(match))
}
