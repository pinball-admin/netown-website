'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import AIModelPanel from '@/components/football/AIModelPanel'
import MatchPredictionCard from '@/components/football/MatchPredictionCard'
import ModeBPanel from '@/components/football/ModeBPanel'
import PersonaExpertsPanel from '@/components/football/PersonaExpertsPanel'
import PostCreator from '@/components/football/PostCreator'
import PostFeed from '@/components/football/PostFeed'
import TeamsHub from '@/components/football/TeamsHub'
import TeamMatrix from '@/components/football/TeamMatrix'
import AmazonBanner from '@/components/football/AmazonBanner'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import AdSenseAd from '@/components/football/AdSenseAd'
import { StaticMatch, teamFlags, getGroupMatches, getKnockoutMatches } from '@/libs/data/worldcup-schedule'
import { useAutoPredictions } from '@/libs/data/swr-hooks'

// Match Data removed - using API predictions instead

// API types for predictions
interface MatchPredictionData {
  match: {
    id: string
    homeTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    awayTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    date: string
    time: string
    group: string
    round: string
  }
  consensus: {
    winner: string
    homeWinProb: number
    drawProb: number
    awayWinProb: number
    predictedScore: { home: number; away: number }
    confidence: number
  }
}

const ALL_GROUPS = ['Group A','Group B','Group C','Group D','Group E','Group F','Group G','Group H','Group I','Group J','Group K','Group L']

const GROUP_EMOJIS: Record<string, string> = {
  'Group A': '🅰️','Group B': '🅱️','Group C': '🅲','Group D': '🅳','Group E': '🅴','Group F': '🅵',
  'Group G': '🅶','Group H': '🅷','Group I': '🅸','Group J': '🅹','Group K': '🅺','Group L': '🅻',
}

const KNOCKOUT_TABS = [
  { key: 'roundOf16', label: 'R16', emoji: '🏃' },
  { key: 'quarterFinals', label: 'QF', emoji: '🔮' },
  { key: 'semiFinals', label: 'SF', emoji: '⚡' },
  { key: 'final', label: 'Final', emoji: '🏆' },
  { key: 'thirdPlace', label: '3rd', emoji: '🥉' },
] as const

const ALL_SCHEDULE_TABS = [...ALL_GROUPS, ...KNOCKOUT_TABS.map(k => k.key)]




export default function MainContentPanel() {
  const { t } = useI18n()
  const [predictionMode, setPredictionMode] = useState<'A' | 'B'>('A')
  const [activeTab, setActiveTab] = useState('Group A')
  const [feedRefreshKey, setFeedRefreshKey] = useState(0)

  // SWR: auto-fetch predictions with revalidation
  const { data: predData, isLoading: scheduleLoading, mutate: refreshPredictions } = useAutoPredictions(60)
  const predictions: MatchPredictionData[] = predData?.success ? predData.predictions : []

  // Build a prediction lookup map by team1-team2-date key
  const predictionMap = useMemo(() => {
    const map: Record<string, MatchPredictionData> = {}
    predictions.forEach(p => {
      const key = `${p.match.homeTeam.id}-${p.match.awayTeam.id}-${p.match.date}`
      map[key] = p
    })
    return map
  }, [predictions])

  // Get static matches for the active tab, with AI prediction overlays
  const getActiveMatches = (tab: string) => {
    let matches: StaticMatch[] = []
    if (tab.startsWith('Group ')) {
      const groupLetter = tab.replace('Group ', '')
      matches = getGroupMatches(groupLetter)
    } else {
      matches = getKnockoutMatches(tab)
    }
    return matches.map(m => ({
      ...m,
      prediction: predictionMap[`${m.team1}-${m.team2}-${m.date}`],
    }))
  }



  // Calculate match counts per group
  const groupMatchCount = useMemo(() => {
    const counts: Record<string, number> = {}
    predictions.forEach((p: MatchPredictionData) => {
      const g = p.match.group || 'Group A'
      counts[g] = (counts[g] || 0) + 1
    })
    return counts
  }, [predictions])

  return (
    <div className="space-y-6">
      {/* Multi-Model AI Prediction Hub */}
      <AIModelPanel />

      {/* Mode A / Mode B Toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setPredictionMode('A')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            predictionMode === 'A'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
          }`}
        >
          🧠 {t('pred.title')}
        </button>
        <button
          onClick={() => setPredictionMode('B')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            predictionMode === 'B'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/5'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
          }`}
        >
          🎲 {t('pred.modeB')}
        </button>
      </div>

      {/* Mode A: AI Smart Predictions */}
      {predictionMode === 'A' && (
        <MatchPredictionCard />
      )}

      {/* Mode B: Monte Carlo Simulation */}
      {predictionMode === 'B' && (
        <ModeBPanel />
      )}

      {/* Ad - Between Predictions and Experts (high engagement zone) */}
      <DynamicAdBanner teamId="worldcup" teamName="World Cup 2026" teamFlag="🏆" variant="inline" />

      {/* 5 AI Persona Masters with live comment threads */}
      <PersonaExpertsPanel />

      {/* World Cup Schedule - All Groups + Knockout Stages */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            📅 {t('schedule.fifaSchedule')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{predictions.length} matches with AI</span>
            <button onClick={() => refreshPredictions()} className="px-3 py-1.5 text-xs bg-slate-800/50 text-slate-400 hover:text-white rounded-lg transition-colors">
              🔄
            </button>
            <button 
              className="px-3 py-1.5 text-xs bg-slate-800/50 text-slate-400 hover:text-white rounded-lg transition-colors"
              onClick={() => window.open('https://www.fifa.com/tournaments/mens/worldcup/2026/schedule', '_blank')}
            >
              {t('schedule.fifaOfficial')}
            </button>
          </div>
        </div>

        {/* Tab Navigation - Groups + Knockout Stages */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {ALL_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveTab(g)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${activeTab === g
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
            >
              <span className="hidden sm:inline">{GROUP_EMOJIS[g]}</span>
              <span>{g.replace('Group ', '')}</span>
              {groupMatchCount[g] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === g ? 'bg-emerald-500/30' : 'bg-slate-700/50'}`}>
                  {groupMatchCount[g]}
                </span>
              )}
            </button>
          ))}
          {/* Separator */}
          <div className="w-px bg-slate-700/60 self-stretch mx-1" />
          {KNOCKOUT_TABS.map((kt) => (
            <button
              key={kt.key}
              onClick={() => setActiveTab(kt.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${activeTab === kt.key
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
            >
              <span>{kt.emoji}</span>
              <span>{kt.label}</span>
            </button>
          ))}
        </div>

        {/* Match List - Static schedule with AI prediction overlays */}
        <div className="space-y-3">
          {getActiveMatches(activeTab).map((match, idx) => {
            const pred = match.prediction
            const homeFlag = teamFlags[match.team1] || '⚽'
            const awayFlag = teamFlags[match.team2] || '⚽'
            const isHomeFav = pred?.consensus.winner === 'home'
            const isAwayFav = pred?.consensus.winner === 'away'
            const isKnockout = !activeTab.startsWith('Group ')

            return (
              <div key={`${match.team1}-${match.team2}-${idx}`} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:border-emerald-500/30">
                <div className="flex flex-col gap-3">
                  {/* Top row: teams vs score */}
                  <div className="flex items-center justify-between">
                    {/* Home */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center border text-sm font-bold flex-shrink-0 ${
                        isHomeFav ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-700/50 border-slate-600 text-white'
                      }`}>
                        {homeFlag}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{match.team1}</div>
                        <div className="text-slate-500 text-[10px]">{isKnockout ? match.venue?.split(',')[0] : match.team1}</div>
                      </div>
                    </div>

                    {/* Score / prediction */}
                    <div className="flex flex-col items-center px-2 sm:px-4 flex-shrink-0">
                      {pred ? (
                        <>
                          <div className="text-slate-500 text-[10px] uppercase tracking-wider">AI predicts</div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-lg sm:text-xl font-extrabold ${isHomeFav ? 'text-emerald-400' : 'text-white'}`}>{pred.consensus.predictedScore.home}</span>
                            <span className="text-slate-500 text-sm">:</span>
                            <span className={`text-lg sm:text-xl font-extrabold ${isAwayFav ? 'text-emerald-400' : 'text-white'}`}>{pred.consensus.predictedScore.away}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-600 text-[10px] uppercase tracking-wider">VS</div>
                          <div className="text-slate-500 text-sm font-bold">-</div>
                        </>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
                      <div className="text-right min-w-0">
                        <div className="text-white text-sm font-medium truncate">{match.team2}</div>
                        <div className="text-slate-500 text-[10px]">{isKnockout ? match.venue?.split(',')[0] : match.team2}</div>
                      </div>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center border text-sm font-bold flex-shrink-0 ${
                        isAwayFav ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-700/50 border-slate-600 text-white'
                      }`}>
                        {awayFlag}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: date, venue, prob bar, confidence */}
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1 whitespace-nowrap">
                      <span>🗓️ {match.date}</span>
                      <span className="hidden sm:inline">· {match.time}</span>
                    </div>

                    {pred ? (
                      <>
                        <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-slate-700/50 max-w-[120px]">
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${pred.consensus.homeWinProb}%` }} />
                          <div className="bg-amber-500/60" style={{ width: `${pred.consensus.drawProb}%` }} />
                          <div className="bg-gradient-to-r from-cyan-400 to-cyan-500" style={{ width: `${pred.consensus.awayWinProb}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          pred.consensus.confidence >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                          pred.consensus.confidence >= 50 ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {pred.consensus.confidence}%
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-600 italic flex-1 text-right">
                        ⏳ AI prediction generating...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* AdSense - Below Schedule */}
      <AdSenseAd adSlot="1234567891" adFormat="horizontal" className="my-4" />

      {/* Amazon Banner */}
      <AmazonBanner />

      {/* 48-Team Global Gateway */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            🌍 {t('home.globalGateway')}
          </h2>
          <div className="text-slate-400 text-sm">
            {t('home.groupsDesc')}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            {t('home.expansionText')}

          </p>
        </div>

        <TeamMatrix />

        <div className="mt-6">
          <TeamsHub />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
              <div className="text-emerald-400 text-lg font-bold mb-2">{t('home.tournamentFormat')}</div>
              <div className="text-slate-300 text-sm">
                {t('home.formatDesc')}
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
              <div className="text-cyan-400 text-lg font-bold mb-2">{t('home.hostCities')}</div>
              <div className="text-slate-300 text-sm">
                {t('home.hostCitiesDesc')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AdSense - Between Info & Community */}
      <AdSenseAd adSlot="1234567895" adFormat="horizontal" className="my-4" />

      {/* Layer 4: Community hub (incremental) */}
      <div className="space-y-4">
        <PostCreator onSuccess={() => setFeedRefreshKey((k) => k + 1)} />
        <PostFeed key={feedRefreshKey} />
        <div className="text-center">
          <Link
            href="/football/forum"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-xl text-orange-400 text-sm font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all"
          >
            {t('forum.openForum')}
          </Link>
        </div>
      </div>
      {/* AdSense - Below Community */}
      <AdSenseAd adSlot="1234567892" adFormat="auto" className="mt-4" />
    </div>
  )
}