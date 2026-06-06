'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { teamFlags, getAllUpcomingMatches } from '@/libs/data/worldcup-schedule'
import type { StaticMatch } from '@/libs/data/worldcup-schedule'

const teamNames: Record<string, string> = {
  MEX:'Mexico',KOR:'South Korea',CZE:'Czech Republic',RSA:'South Africa',
  CAN:'Canada',BIH:'Bosnia',QAT:'Qatar',SUI:'Switzerland',
  BRA:'Brazil',MAR:'Morocco',HAI:'Haiti',SCO:'Scotland',
  USA:'United States',PAR:'Paraguay',AUS:'Australia',TUR:'Turkey',
  GER:'Germany',CUW:'Curacao',ECU:'Ecuador',CIV:'Ivory Coast',
  NED:'Netherlands',JPN:'Japan',SWE:'Sweden',TUN:'Tunisia',
  BEL:'Belgium',EGY:'Egypt',IRN:'Iran',NZL:'New Zealand',
  ESP:'Spain',CPV:'Cape Verde',KSA:'Saudi Arabia',URU:'Uruguay',
  FRA:'France',SEN:'Senegal',IRQ:'Iraq',NOR:'Norway',
  ARG:'Argentina',ALG:'Algeria',AUT:'Austria',JOR:'Jordan',
  POR:'Portugal',COD:'Congo DR',UZB:'Uzbekistan',COL:'Colombia',
  ENG:'England',CRO:'Croatia',GHA:'Ghana',PAN:'Panama',
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export default function CountdownBanner() {
  const { t } = useI18n()
  const [nextMatch, setNextMatch] = useState<StaticMatch | null>(null)
  const [countdown, setCountdown] = useState('')
  const [phase, setPhase] = useState<'loading' | 'countdown' | 'opening_soon' | 'live'>('loading')

  useEffect(() => {
    const matches = getAllUpcomingMatches()
    const now = new Date()
    
    // Find the next match
    const upcoming = matches.find(m => {
      const matchDate = new Date(`${m.date}T${m.time}:00`)
      return matchDate.getTime() > now.getTime()
    })

    if (upcoming) {
      setNextMatch(upcoming)

      const matchTime = new Date(`${upcoming.date}T${upcoming.time}:00`).getTime()
      const diff = matchTime - now.getTime()

      if (diff <= 3600000 && diff > 0) {
        setPhase('live')
      } else if (diff <= 86400000) {
        setPhase('opening_soon')
      } else {
        setPhase('countdown')
      }

      // Update countdown every second
      const interval = setInterval(() => {
        const nowMs = Date.now()
        const remaining = matchTime - nowMs
        if (remaining <= 0) {
          setCountdown(t('home.matchLive') || 'LIVE NOW!')
          clearInterval(interval)
        } else {
          setCountdown(formatCountdown(remaining))
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [t])

  if (!nextMatch) return null

  const homeFlag = teamFlags[nextMatch.team1] || '⚽'
  const awayFlag = teamFlags[nextMatch.team2] || '⚽'
  const homeName = teamNames[nextMatch.team1] || nextMatch.team1
  const awayName = teamNames[nextMatch.team2] || nextMatch.team2

  return (
    <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/20 to-emerald-900/40 border border-emerald-500/20 rounded-xl p-4 mb-6 overflow-hidden relative">
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Match info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{homeFlag}</span>
            <span className="text-white font-semibold text-sm sm:text-base truncate">{homeName}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {phase === 'live' ? t('home.matchLive') : phase === 'opening_soon' ? t('home.StartingSoon') : t('home.nextMatch')}
            </span>
            <div className="bg-emerald-500/20 px-3 py-1 rounded-full">
              <span className="text-emerald-300 font-mono text-sm font-bold">VS</span>
            </div>
            <span className="text-slate-500 text-xs">
              {nextMatch.date} · {nextMatch.time}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white font-semibold text-sm sm:text-base truncate">{awayName}</span>
            <span className="text-2xl">{awayFlag}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className={`text-center ${phase === 'live' ? 'animate-pulse' : ''}`}>
          <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-wider ${
            phase === 'live' ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {countdown}
          </div>
          <div className="text-slate-500 text-xs mt-1">{nextMatch.venue}</div>
        </div>
      </div>
    </div>
  )
}
