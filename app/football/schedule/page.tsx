'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

const teamFlags: Record<string, string> = {
  'USA': '🇺🇸', 'MAR': '🇲🇦', 'CRO': '🇭🇷', 'NGA': '🇳🇬',
  'ENG': '🏴', 'IRN': '🇮🇷', 'WAL': '🏴', 'FIN': '🇫🇮',
  'ARG': '🇦🇷', 'KSA': '🇸🇦', 'MEX': '🇲🇽', 'ECU': '🇪🇨',
  'FRA': '🇫🇷', 'AUS': '🇦🇺', 'GER': '🇩🇪', 'JPN': '🇯🇵',
  'ESP': '🇪🇸', 'NZL': '🇳🇿', 'BEL': '🇧🇪', 'CAN': '🇨🇦',
  'BRA': '🇧🇷', 'SRB': '🇷🇸', 'NED': '🇳🇱', 'JAM': '🇯🇲',
  'POR': '🇵🇹', 'KOR': '🇰🇷', 'URU': '🇺🇾', 'PAN': '🇵🇦',
  'ITA': '🇮🇹', 'ALG': '🇩🇿', 'CHI': '🇨🇱', 'POL': '🇵🇱',
  'SWE': '🇸🇪', 'SUI': '🇨🇭', 'DEN': '🇩🇰', 'NOR': '🇳🇴',
  'UKR': '🇺🇦', 'GRE': '🇬🇷', 'TUR': '🇹🇷', 'ROM': '🇷🇴',
  '1A': '🏆', '1B': '🏆', '1C': '🏆', '1D': '🏆', '1E': '🏆', '1F': '🏆', '1G': '🏆', '1H': '🏆',
  '2A': '🥈', '2B': '🥈', '2C': '🥈', '2D': '🥈', '2E': '🥈', '2F': '🥈', '2G': '🥈', '2H': '🥈',
  'W49': '⚽', 'W50': '⚽', 'W51': '⚽', 'W52': '⚽', 'W53': '⚽', 'W54': '⚽', 'W55': '⚽', 'W56': '⚽',
  'W57': '⚽', 'W58': '⚽', 'W59': '⚽', 'W60': '⚽', 'W61': '🏆', 'W62': '🏆',
  'L61': '🥉', 'L62': '🥉',
}

export default function SchedulePage() {
  const { t, tTeam } = useI18n()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Link href="/football" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t('schedule.backToDashboard')}</span>
          </Link>
        </div>
      </nav>

      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {t('schedule.title')}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {t('schedule.venues48')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <a href="#group-stage" className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors">
              {t('schedule.groupStage')}
            </a>
            <a href="#round-of-16" className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors">
              {t('schedule.roundOf16')}
            </a>
            <a href="#quarter-finals" className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors">
              {t('schedule.quarterFinals')}
            </a>
            <a href="#semi-finals" className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors">
              {t('schedule.semiFinals')}
            </a>
            <a href="#final" className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors">
              {t('schedule.final')}
            </a>
          </div>

          <section id="group-stage" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">{t('schedule.groupStage')}</h2>
              <span className="text-slate-400 text-sm">{t('common.juneDate')}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((group) => (
                <div key={group} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-slate-700/50">
                    <h3 className="text-lg font-bold text-emerald-400">{t(`schedule.group${group}`)}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {getGroupMatches(group).map((match, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{teamFlags[match.team1] || '⚽'}</span>
                            <span className="text-white font-medium text-sm">{t(`teams.${match.team1}`)}</span>
                          </div>
                          <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-900/50 rounded">{t('schedule.vs')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{t(`teams.${match.team2}`)}</span>
                            <span className="text-lg">{teamFlags[match.team2] || '⚽'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="px-2 py-0.5 bg-slate-900/50 rounded">{match.day} {match.date}</span>
                          <span className="text-emerald-400 font-medium">{match.time}</span>
                          <span className="truncate max-w-[120px]">{t(`schedule.venues.${match.venue}`) || match.venue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="round-of-16" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">{t('schedule.roundOf16')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getKnockoutMatches('roundOf16').map((match, idx) => (
                <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{teamFlags[match.team1] || '⚽'}</span>
                      <span className="text-white font-semibold">{t(`teams.${match.team1}`)}</span>
                    </div>
                    <span className="text-slate-500 font-bold">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{t(`teams.${match.team2}`)}</span>
                      <span className="text-2xl">{teamFlags[match.team2] || '⚽'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{match.date}</span>
                    <span className="text-emerald-400 font-medium">{match.time}</span>
                    <span>{t(`schedule.venues.${match.venue}`) || match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="quarter-finals" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">{t('schedule.quarterFinals')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getKnockoutMatches('quarterFinals').map((match, idx) => (
                <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{teamFlags[match.team1] || '⚽'}</span>
                      <span className="text-white font-semibold">{t(`teams.${match.team1}`)}</span>
                    </div>
                    <span className="text-slate-500 font-bold">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{t(`teams.${match.team2}`)}</span>
                      <span className="text-2xl">{teamFlags[match.team2] || '⚽'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{match.date}</span>
                    <span className="text-emerald-400 font-medium">{match.time}</span>
                    <span>{t(`schedule.venues.${match.venue}`) || match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="semi-finals" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">{t('schedule.semiFinals')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getKnockoutMatches('semiFinals').map((match, idx) => (
                <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{teamFlags[match.team1] || '⚽'}</span>
                      <span className="text-white font-semibold">{t(`teams.${match.team1}`)}</span>
                    </div>
                    <span className="text-slate-500 font-bold">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{t(`teams.${match.team2}`)}</span>
                      <span className="text-2xl">{teamFlags[match.team2] || '⚽'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{match.date}</span>
                    <span className="text-emerald-400 font-medium">{match.time}</span>
                    <span>{t(`schedule.venues.${match.venue}`) || match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="final" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">{t('schedule.final')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {getKnockoutMatches('final').map((match, idx) => (
                <div key={idx} className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md border border-amber-600/50 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">{teamFlags[match.team1] || '⚽'}</span>
                      <span className="text-white font-bold text-lg">{t(`teams.${match.team1}`)}</span>
                    </div>
                    <span className="text-amber-400 font-extrabold text-3xl">VS</span>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">{teamFlags[match.team2] || '⚽'}</span>
                      <span className="text-white font-bold text-lg">{t(`teams.${match.team2}`)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                    <span>{match.date}</span>
                    <span className="text-amber-400 font-medium">{match.time}</span>
                    <span>{t(`schedule.venues.${match.venue}`) || match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function getGroupMatches(group: string) {
  const allMatches: Record<string, Array<{team1: string, team2: string, date: string, time: string, venue: string, day: string}>> = {
    'A': [
      { team1: 'USA', team2: 'MAR', date: '2026-06-11', time: '20:00', venue: 'SoFi Stadium', day: 'Thu' },
      { team1: 'CRO', team2: 'NGA', date: '2026-06-12', time: '18:00', venue: 'MetLife Stadium', day: 'Fri' },
      { team1: 'SWE', team2: 'AUT', date: '2026-06-12', time: '21:00', venue: 'Rose Bowl', day: 'Fri' },
      { team1: 'USA', team2: 'CRO', date: '2026-06-16', time: '21:00', venue: 'AT&T Stadium', day: 'Tue' },
      { team1: 'MAR', team2: 'SWE', date: '2026-06-16', time: '18:00', venue: 'Lincoln Financial Field', day: 'Tue' },
      { team1: 'NGA', team2: 'AUT', date: '2026-06-17', time: '15:00', venue: 'Levi Stadium', day: 'Wed' },
    ],
    'B': [
      { team1: 'ENG', team2: 'IRN', date: '2026-06-13', time: '18:00', venue: 'Levi Stadium', day: 'Sat' },
      { team1: 'WAL', team2: 'FIN', date: '2026-06-13', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Sat' },
      { team1: 'SUI', team2: 'GHA', date: '2026-06-14', time: '15:00', venue: 'Rose Bowl', day: 'Sun' },
      { team1: 'ENG', team2: 'WAL', date: '2026-06-17', time: '20:00', venue: 'SoFi Stadium', day: 'Wed' },
      { team1: 'IRN', team2: 'SUI', date: '2026-06-18', time: '18:00', venue: 'NRG Stadium', day: 'Thu' },
      { team1: 'FIN', team2: 'GHA', date: '2026-06-18', time: '21:00', venue: 'Lamar Hunt US Bank Stadium', day: 'Thu' },
    ],
    'C': [
      { team1: 'ARG', team2: 'KSA', date: '2026-06-12', time: '15:00', venue: 'MetLife Stadium', day: 'Fri' },
      { team1: 'MEX', team2: 'ECU', date: '2026-06-12', time: '21:00', venue: 'Rose Bowl', day: 'Fri' },
      { team1: 'DEN', team2: 'CMR', date: '2026-06-13', time: '15:00', venue: 'Lamar Hunt US Bank Stadium', day: 'Sat' },
      { team1: 'ARG', team2: 'MEX', date: '2026-06-17', time: '21:00', venue: 'SoFi Stadium', day: 'Wed' },
      { team1: 'KSA', team2: 'DEN', date: '2026-06-18', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
      { team1: 'ECU', team2: 'CMR', date: '2026-06-19', time: '15:00', venue: 'MetLife Stadium', day: 'Fri' },
    ],
    'D': [
      { team1: 'FRA', team2: 'AUS', date: '2026-06-13', time: '15:00', venue: 'Lamar Hunt US Bank Stadium', day: 'Sat' },
      { team1: 'GER', team2: 'JPN', date: '2026-06-13', time: '20:00', venue: 'Lincoln Financial Field', day: 'Sat' },
      { team1: 'NOR', team2: 'TUN', date: '2026-06-14', time: '18:00', venue: 'Levi Stadium', day: 'Sun' },
      { team1: 'FRA', team2: 'GER', date: '2026-06-18', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
      { team1: 'AUS', team2: 'NOR', date: '2026-06-19', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Fri' },
      { team1: 'JPN', team2: 'TUN', date: '2026-06-19', time: '18:00', venue: 'NRG Stadium', day: 'Fri' },
    ],
    'E': [
      { team1: 'ESP', team2: 'NZL', date: '2026-06-14', time: '18:00', venue: 'Levi Stadium', day: 'Sun' },
      { team1: 'BEL', team2: 'CAN', date: '2026-06-14', time: '21:00', venue: 'AT&T Stadium', day: 'Sun' },
      { team1: 'UKR', team2: 'COL', date: '2026-06-15', time: '15:00', venue: 'MetLife Stadium', day: 'Mon' },
      { team1: 'ESP', team2: 'BEL', date: '2026-06-19', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Fri' },
      { team1: 'NZL', team2: 'CAN', date: '2026-06-19', time: '18:00', venue: 'NRG Stadium', day: 'Fri' },
      { team1: 'UKR', team2: 'ESP', date: '2026-06-23', time: '21:00', venue: 'NRG Stadium', day: 'Tue' },
    ],
    'F': [
      { team1: 'BRA', team2: 'SRB', date: '2026-06-14', time: '20:00', venue: 'Mercedes-Benz Stadium', day: 'Sun' },
      { team1: 'NED', team2: 'JAM', date: '2026-06-15', time: '18:00', venue: 'NRG Stadium', day: 'Mon' },
      { team1: 'GRE', team2: 'PER', date: '2026-06-15', time: '21:00', venue: 'Lincoln Financial Field', day: 'Mon' },
      { team1: 'BRA', team2: 'NED', date: '2026-06-19', time: '18:00', venue: 'SoFi Stadium', day: 'Fri' },
      { team1: 'SRB', team2: 'GRE', date: '2026-06-19', time: '21:00', venue: 'Lamar Hunt US Bank Stadium', day: 'Fri' },
      { team1: 'JAM', team2: 'PER', date: '2026-06-23', time: '18:00', venue: 'Levi Stadium', day: 'Tue' },
    ],
    'G': [
      { team1: 'POR', team2: 'KOR', date: '2026-06-15', time: '21:00', venue: 'SoFi Stadium', day: 'Mon' },
      { team1: 'URU', team2: 'PAN', date: '2026-06-16', time: '15:00', venue: 'Mercedes-Benz Stadium', day: 'Tue' },
      { team1: 'TUR', team2: 'PAR', date: '2026-06-16', time: '18:00', venue: 'AT&T Stadium', day: 'Tue' },
      { team1: 'POR', team2: 'URU', date: '2026-06-20', time: '18:00', venue: 'Mercedes-Benz Stadium', day: 'Sat' },
      { team1: 'KOR', team2: 'TUR', date: '2026-06-20', time: '21:00', venue: 'AT&T Stadium', day: 'Sat' },
      { team1: 'PAN', team2: 'PAR', date: '2026-06-24', time: '18:00', venue: 'Rose Bowl', day: 'Wed' },
    ],
    'H': [
      { team1: 'ITA', team2: 'ALG', date: '2026-06-16', time: '21:00', venue: 'MetLife Stadium', day: 'Tue' },
      { team1: 'CHI', team2: 'POL', date: '2026-06-17', time: '15:00', venue: 'Levi Stadium', day: 'Wed' },
      { team1: 'ROM', team2: 'VEN', date: '2026-06-17', time: '18:00', venue: 'Rose Bowl', day: 'Wed' },
      { team1: 'ITA', team2: 'CHI', date: '2026-06-21', time: '18:00', venue: 'Levi Stadium', day: 'Sun' },
      { team1: 'ALG', team2: 'ROM', date: '2026-06-21', time: '21:00', venue: 'Lamar Hunt US Bank Stadium', day: 'Sun' },
      { team1: 'POL', team2: 'VEN', date: '2026-06-25', time: '21:00', venue: 'NRG Stadium', day: 'Thu' },
    ],
  }
  return allMatches[group] || []
}

function getKnockoutMatches(stage: string) {
  const knockouts: Record<string, Array<{team1: string, team2: string, date: string, time: string, venue: string}>> = {
    'roundOf16': [
      { team1: '1A', team2: '2B', date: '2026-06-27', time: '18:00', venue: 'Mercedes-Benz Stadium' },
      { team1: '1C', team2: '2D', date: '2026-06-27', time: '21:00', venue: 'SoFi Stadium' },
      { team1: '1E', team2: '2F', date: '2026-06-28', time: '18:00', venue: 'AT&T Stadium' },
      { team1: '1G', team2: '2H', date: '2026-06-28', time: '21:00', venue: 'NRG Stadium' },
      { team1: '1B', team2: '2A', date: '2026-06-29', time: '18:00', venue: 'MetLife Stadium' },
      { team1: '1D', team2: '2C', date: '2026-06-29', time: '21:00', venue: 'Levi Stadium' },
      { team1: '1F', team2: '2E', date: '2026-06-30', time: '18:00', venue: 'Lincoln Financial Field' },
      { team1: '1H', team2: '2G', date: '2026-06-30', time: '21:00', venue: 'Rose Bowl' },
    ],
    'quarterFinals': [
      { team1: 'W49', team2: 'W50', date: '2026-07-03', time: '18:00', venue: 'Mercedes-Benz Stadium' },
      { team1: 'W51', team2: 'W52', date: '2026-07-03', time: '21:00', venue: 'SoFi Stadium' },
      { team1: 'W53', team2: 'W54', date: '2026-07-04', time: '18:00', venue: 'AT&T Stadium' },
      { team1: 'W55', team2: 'W56', date: '2026-07-04', time: '21:00', venue: 'NRG Stadium' },
    ],
    'semiFinals': [
      { team1: 'W57', team2: 'W58', date: '2026-07-08', time: '21:00', venue: 'MetLife Stadium' },
      { team1: 'W59', team2: 'W60', date: '2026-07-09', time: '21:00', venue: 'SoFi Stadium' },
    ],
    'final': [
      { team1: 'W61', team2: 'W62', date: '2026-07-12', time: '20:00', venue: 'Hard Rock Stadium' },
    ],
    'thirdPlace': [
      { team1: 'L61', team2: 'L62', date: '2026-07-11', time: '18:00', venue: 'Mercedes-Benz Stadium' },
    ],
  }
  return knockouts[stage] || []
}
