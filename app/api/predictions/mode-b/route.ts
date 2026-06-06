import { NextResponse } from 'next/server'
import { runModeBPrediction, runModeBForMatches } from '@/libs/prediction/mode-b-model'
import { initializeEnsemble } from '@/libs/prediction/ensemble-engine'
import { fetchMatchSchedule, getUpcomingMatches, getMockMatchSchedule } from '@/libs/services/wheniskickoff'
import { Match } from '@/libs/types'

export const dynamic = 'force-dynamic'

/**
 * Mode B - Monte Carlo Simulation API
 * 
 * Runs 10,000 simulations per match to discover "crazy" scorelines
 * and tail-distribution probabilities.
 * 
 * GET /api/predictions/mode-b?homeTeam=ARG&awayTeam=BRA
 * GET /api/predictions/mode-b?limit=4&group=A
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const homeTeam = searchParams.get('homeTeam')
    const awayTeam = searchParams.get('awayTeam')
    const limit = parseInt(searchParams.get('limit') || '4')
    const group = searchParams.get('group') || ''

    // Initialize ensemble for best team parameters
    try {
      await initializeEnsemble()
    } catch {
      // Non-fatal, will use default params
    }

    // Single match query
    if (homeTeam && awayTeam) {
      const result = runModeBPrediction(homeTeam.toUpperCase(), awayTeam.toUpperCase(), true)

      return NextResponse.json({
        success: true,
        mode: 'B',
        description: 'Monte Carlo Simulation (10,000 iterations)',
        totalSimulations: result.totalSimulations,
        prediction: result,
        generatedAt: new Date().toISOString(),
      })
    }

    // Batch mode: fetch upcoming matches and run simulations
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

    // Run Mode B for each match
    const predictions = targetMatches.map(match => {
      const simResult = runModeBPrediction(
        match.homeTeam.id,
        match.awayTeam.id,
        true
      )

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
        simulation: simResult,
        // Single "crazy score" highlight
        crazyScoreHighlight: simResult.crazyScores.mostLikelyCrazy
          ? {
              score: `${simResult.crazyScores.mostLikelyCrazy.homeScore}-${simResult.crazyScores.mostLikelyCrazy.awayScore}`,
              probability: simResult.crazyScores.mostLikelyCrazy.probability,
              totalGoals: simResult.crazyScores.mostLikelyCrazy.homeScore + simResult.crazyScores.mostLikelyCrazy.awayScore,
            }
          : null,
        mostLikely: simResult.topScores[0]
          ? {
              score: `${simResult.topScores[0].homeScore}-${simResult.topScores[0].awayScore}`,
              probability: simResult.topScores[0].probability,
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      mode: 'B',
      description: 'Monte Carlo Simulation (10,000 iterations per match)',
      totalSimulations: 10000,
      totalMatches: predictions.length,
      predictions,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Mode B prediction error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate Mode B predictions'
    }, { status: 500 })
  }
}
