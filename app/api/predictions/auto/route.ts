import { NextResponse } from 'next/server'
import { fetchMatchSchedule, getUpcomingMatches, getMockMatchSchedule } from '@/libs/services/wheniskickoff'
import { initializeEnsemble, predictMatch } from '@/libs/prediction/ensemble-engine'
import { generateExpertPredictions } from '@/libs/prediction/ml-model'
import { Match, EXPERT_IDS, ExpertId } from '@/libs/types'

export const dynamic = 'force-dynamic'

/**
 * Auto Prediction API - Enhanced with Ensemble Model
 * 
 * Uses Dixon-Coles + ELO + Form + H2H for real predictions
 * Falls back to basic ELO model if ensemble fails
 * 
 * GET /api/predictions/auto?limit=8&group=A
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const group = searchParams.get('group') || ''

    // Initialize ensemble with historical data
    let ensembleReady = false
    try {
      await initializeEnsemble()
      ensembleReady = true
    } catch {
      console.warn('[Auto] Ensemble init failed, using basic model')
    }

    // Fetch match schedule
    let matches: Match[]
    try {
      matches = await fetchMatchSchedule()
    } catch {
      matches = getMockMatchSchedule()
    }

    if (matches.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No matches found'
      }, { status: 404 })
    }

    // Filter by group if specified
    if (group) {
      matches = matches.filter(m => m.group.toLowerCase().includes(group.toLowerCase()))
    }

    // Get upcoming matches
    const upcoming = getUpcomingMatches(matches, limit)
    const targetMatches = upcoming.length > 0 ? upcoming : matches.slice(0, limit)

    // Generate predictions
    const predictionsWithMatches = targetMatches.map(match => {
      if (ensembleReady) {
        // Use ensemble model (Dixon-Coles + ELO + Form + H2H)
        try {
          const ensemble = predictMatch(match)
          
          return {
            match: {
              id: match.id,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              date: match.date,
              time: match.time,
              venue: match.venue,
              group: match.group,
              status: match.status,
              round: match.round,
            },
            consensus: {
              winner: ensemble.consensusWinner,
              homeWinProb: ensemble.homeWinProb,
              drawProb: ensemble.drawProb,
              awayWinProb: ensemble.awayWinProb,
              predictedScore: ensemble.predictedScore,
              predictedHalfTime: ensemble.predictedHalfTime,
              overUnder: ensemble.over25Prob >= 50 ? 'over' : 'under',
              overProb: ensemble.over25Prob,
              bothTeamsScoreProb: ensemble.bttsProb,
              goalDistribution: ensemble.goalDistribution,
              confidence: ensemble.confidence,
            },
            experts: ensemble.experts.map(e => ({
              expertId: e.expertId,
              winner: e.winner,
              score: e.score,
              halfTime: e.halfTime,
              overUnder: e.overUnder,
              confidence: e.confidence,
              homeWinProb: e.homeWinProb,
              drawProb: e.drawProb,
              awayWinProb: e.awayWinProb,
              reasoning: e.reasoning,
            })),
            models: ensemble.models,
            analysis: ensemble.analysis,
          }
        } catch (err) {
          console.warn('[Auto] Ensemble failed for match, falling back:', err)
        }
      }

      // Fallback: basic ELO model
      const expertPredictions = generateExpertPredictions(match)
      const experts = EXPERT_IDS
      let totalHomeWin = 0, totalDraw = 0, totalAwayWin = 0
      let totalHomeGoals = 0, totalAwayGoals = 0
      let totalOver = 0

      experts.forEach(id => {
        const pred = expertPredictions[id]
        totalHomeWin += pred.homeWinProb || 0
        totalDraw += pred.drawProb || 0
        totalAwayWin += pred.awayWinProb || 0
        totalHomeGoals += pred.predictedScore.home
        totalAwayGoals += pred.predictedScore.away
        if (pred.predictedOverUnder === 'over') totalOver++
      })

      const count = experts.length
      const consensusHomeWin = Math.round(totalHomeWin / count)
      const consensusDraw = Math.round(totalDraw / count)
      const consensusAwayWin = Math.round(totalAwayWin / count)

      const consensusWinner: 'home' | 'draw' | 'away' =
        consensusHomeWin > consensusAwayWin ? 'home' :
        consensusAwayWin > consensusHomeWin ? 'away' : 'draw'

      const consensusScore = {
        home: Math.round(totalHomeGoals / count),
        away: Math.round(totalAwayGoals / count)
      }

      const consensusHT = {
        home: Math.round(consensusScore.home * 0.4),
        away: Math.round(consensusScore.away * 0.4)
      }

      const firstExpert = expertPredictions[experts[0]]

      return {
        match: {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          date: match.date,
          time: match.time,
          venue: match.venue,
          group: match.group,
          status: match.status,
          round: match.round,
        },
        consensus: {
          winner: consensusWinner,
          homeWinProb: consensusHomeWin,
          drawProb: consensusDraw,
          awayWinProb: consensusAwayWin,
          predictedScore: consensusScore,
          predictedHalfTime: consensusHT,
          overUnder: totalOver >= count / 2 ? 'over' : 'under',
          overProb: Math.round((totalOver / count) * 100),
          bothTeamsScoreProb: firstExpert?.bothTeamsScoreProb || 50,
          goalDistribution: firstExpert?.goalDistribution || [],
          confidence: Math.round(experts.reduce((sum, id) => sum + expertPredictions[id].confidence, 0) / count),
        },
        experts: experts.map(id => ({
          expertId: id,
          winner: expertPredictions[id].predictedWinner,
          score: expertPredictions[id].predictedScore,
          halfTime: expertPredictions[id].predictedHalfTime,
          overUnder: expertPredictions[id].predictedOverUnder,
          confidence: expertPredictions[id].confidence,
          homeWinProb: expertPredictions[id].homeWinProb,
          drawProb: expertPredictions[id].drawProb,
          awayWinProb: expertPredictions[id].awayWinProb,
          reasoning: expertPredictions[id].reasoning,
        })),
      }
    })

    return NextResponse.json({
      success: true,
      total: predictionsWithMatches.length,
      predictions: predictionsWithMatches,
      engine: ensembleReady ? 'ensemble' : 'basic-elo',
      models: ensembleReady 
        ? ['Dixon-Coles', 'Enhanced ELO', 'Form Analysis', 'Head-to-Head']
        : ['ELO Rating'],
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Auto prediction error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate predictions'
    }, { status: 500 })
  }
}
