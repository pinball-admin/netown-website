'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

interface ScoreEntry {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'scheduled' | 'live' | 'ht' | 'finished'
  minute: string | null
  round: string
}

const TEAM_FLAGS: Record<string, string> = {
  MEX: '🇲🇽', KOR: '🇰🇷', CZE: '🇨🇿', RSA: '🇿🇦', CAN: '🇨🇦', BIH: '🇧🇦',
  QAT: '🇶🇦', SUI: '🇨🇭', BRA: '🇧🇷', MAR: '🇲🇦', HAI: '🇭🇹', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸', PAR: '🇵🇾', AUS: '🇦🇺', TUR: '🇹🇷', GER: '🇩🇪', CUW: '🇨🇼',
  ECU: '🇪🇨', CIV: '🇨🇮', NED: '🇳🇱', JPN: '🇯🇵', SWE: '🇸🇪', TUN: '🇹🇳',
  BEL: '🇧🇪', EGY: '🇪🇬', IRN: '🇮🇷', NZL: '🇳🇿', ESP: '🇪🇸', CPV: '🇨🇻',
  KSA: '🇸🇦', URU: '🇺🇾', FRA: '🇫🇷', SEN: '🇸🇳', IRQ: '🇮🇶', NOR: '🇳🇴',
  ARG: '🇦🇷', ALG: '🇩🇿', AUT: '🇦🇹', JOR: '🇯🇴', POR: '🇵🇹', COD: '🇨🇩',
  UZB: '🇺🇿', COL: '🇨🇴', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', CRO: '🇭🇷', GHA: '🇬🇭', PAN: '🇵🇦',
}

const TEAM_NAMES: Record<string, string> = {
  MEX: 'Mexico', KOR: 'South Korea', CZE: 'Czech Republic', RSA: 'South Africa',
  CAN: 'Canada', BIH: 'Bosnia', QAT: 'Qatar', SUI: 'Switzerland', BRA: 'Brazil',
  MAR: 'Morocco', HAI: 'Haiti', SCO: 'Scotland', USA: 'United States', PAR: 'Paraguay',
  AUS: 'Australia', TUR: 'Turkey', GER: 'Germany', CUW: 'Curacao', ECU: 'Ecuador',
  CIV: 'Ivory Coast', NED: 'Netherlands', JPN: 'Japan', SWE: 'Sweden', TUN: 'Tunisia',
  BEL: 'Belgium', EGY: 'Egypt', IRN: 'Iran', NZL: 'New Zealand', ESP: 'Spain',
  CPV: 'Cape Verde', KSA: 'Saudi Arabia', URU: 'Uruguay', FRA: 'France', SEN: 'Senegal',
  IRQ: 'Iraq', NOR: 'Norway', ARG: 'Argentina', ALG: 'Algeria', AUT: 'Austria',
  JOR: 'Jordan', POR: 'Portugal', COD: 'DR Congo', UZB: 'Uzbekistan', COL: 'Colombia',
  ENG: 'England', CRO: 'Croatia', GHA: 'Ghana', PAN: 'Panama',
}

export default function LiveScoreBoard() {
  const { t } = useI18n()
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [filter, setFilter] = useState<'all' | 'live' | 'finished' | 'scheduled'>('all')

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/livescores')
      if (!res.ok) return
      const json = await res.json()
      if (json.success) {
        setScores(json.results)
        setLastRefresh(new Date())
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchScores()
    const interval = setInterval(fetchScores, 30000) // 30s polling
    return () => clearInterval(interval)
  }, [fetchScores])

  const filtered = scores.filter(s => {
    if (filter === 'all') return true
    if (filter === 'live') return s.status === 'live' || s.status === 'ht'
    return s.status === filter
  })

  const hasLive = scores.some(s => s.status === 'live' || s.status === 'ht')
  const nowPlaying = scores.filter(s => s.status === 'live' || s.status === 'ht')
  const finished = scores.filter(s => s.status === 'finished')
  const upcoming = scores.filter(s => s.status === 'scheduled')

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            ⚽ {t('schedule.title') || 'Live Scores'}
          </h2>
          {hasLive && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 text-sm">
          {(['all', 'live', 'finished', 'scheduled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {f === 'all' && `${t('teamsHub.all') || 'All'} (${scores.length})`}
              {f === 'live' && `Live (${nowPlaying.length})`}
              {f === 'finished' && `FT (${finished.length})`}
              {f === 'scheduled' && `Upcoming (${upcoming.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Score List */}
      <div className="p-5 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-3xl mb-2">⚽</p>
            <p className="text-sm">No matches found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((match) => (
              <Link
                key={match.id}
                href={`/football/schedule?match=${match.id}`}
                className={`block p-3 rounded-lg border transition-all hover:-translate-y-0.5 ${
                  match.status === 'live' || match.status === 'ht'
                    ? 'bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10'
                    : match.status === 'finished'
                    ? 'bg-slate-800/20 border-slate-700/40 hover:bg-slate-800/40'
                    : 'bg-slate-800/10 border-slate-700/30 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{TEAM_FLAGS[match.homeTeam] || '⚽'}</span>
                    <span className={`text-sm font-medium truncate ${
                      match.status === 'finished' && match.homeScore > match.awayScore
                        ? 'text-emerald-400'
                        : 'text-slate-200'
                    }`}>
                      {TEAM_NAMES[match.homeTeam] || match.homeTeam}
                    </span>
                  </div>

                  {/* Score / Status */}
                  <div className="flex items-center gap-3 mx-3">
                    {match.status === 'scheduled' ? (
                      <span className="text-xs text-slate-500 whitespace-nowrap">vs</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold tabular-nums ${
                          match.status === 'finished' && match.homeScore > match.awayScore
                            ? 'text-emerald-400'
                            : 'text-white'
                        }`}>
                          {match.homeScore}
                        </span>
                        <span className="text-sm text-slate-500">-</span>
                        <span className={`text-lg font-bold tabular-nums ${
                          match.status === 'finished' && match.awayScore > match.homeScore
                            ? 'text-emerald-400'
                            : 'text-white'
                        }`}>
                          {match.awayScore}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className={`text-sm font-medium truncate ${
                      match.status === 'finished' && match.awayScore > match.homeScore
                        ? 'text-emerald-400'
                        : 'text-slate-200'
                    }`}>
                      {TEAM_NAMES[match.awayTeam] || match.awayTeam}
                    </span>
                    <span className="text-lg">{TEAM_FLAGS[match.awayTeam] || '⚽'}</span>
                  </div>
                </div>

                {/* Bottom row: status badge + minute */}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-500">{match.round}</span>
                  <div className="flex items-center gap-2">
                    {match.status === 'live' && (
                      <span className="text-xs text-emerald-400 font-medium">
                        {match.minute || "LIVE"}
                      </span>
                    )}
                    {match.status === 'ht' && (
                      <span className="text-xs text-yellow-400 font-medium">HT</span>
                    )}
                    {match.status === 'finished' && (
                      <span className="text-xs text-slate-500">FT</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
        </span>
        <Link
          href="/football/schedule"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {t('schedule.viewFull') || 'Full Schedule'} →
        </Link>
      </div>
    </div>
  )
}
