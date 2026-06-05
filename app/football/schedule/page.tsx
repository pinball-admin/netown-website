'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import FootballTopBar from '@/components/football/FootballTopBar'
import MobileBottomNav from '@/components/football/MobileBottomNav'
import MatchPredictionCard from '@/components/football/MatchPredictionCard'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import InlinePrediction from '@/components/football/InlinePrediction'

const teamFlags: Record<string, string> = {
  'MEX': '🇲🇽', 'KOR': '🇰🇷', 'CZE': '🇨🇿', 'RSA': '🇿🇦',
  'CAN': '🇨🇦', 'BIH': '🇧🇦', 'QAT': '🇶🇦', 'SUI': '🇨🇭',
  'BRA': '🇧🇷', 'MAR': '🇲🇦', 'HAI': '🇭🇹', 'SCO': '🏴',
  'USA': '🇺🇸', 'PAR': '🇵🇾', 'AUS': '🇦🇺', 'TUR': '🇹🇷',
  'GER': '🇩🇪', 'CUW': '🇨🇼', 'ECU': '🇪🇨', 'CIV': '🇨🇮',
  'NED': '🇳🇱', 'JPN': '🇯🇵', 'SWE': '🇸🇪', 'TUN': '🇹🇳',
  'BEL': '🇧🇪', 'EGY': '🇪🇬', 'IRN': '🇮🇷', 'NZL': '🇳🇿',
  'ESP': '🇪🇸', 'CPV': '🇨🇻', 'KSA': '🇸🇦', 'URU': '🇺🇾',
  'FRA': '🇫🇷', 'SEN': '🇸🇳', 'IRQ': '🇮🇶', 'NOR': '🇳🇴',
  'ARG': '🇦🇷', 'ALG': '🇩🇿', 'AUT': '🇦🇹', 'JOR': '🇯🇴',
  'POR': '🇵🇹', 'COD': '🇨🇩', 'UZB': '🇺🇿', 'COL': '🇨🇴',
  'ENG': '🏴', 'CRO': '🇭🇷', 'GHA': '🇬🇭', 'PAN': '🇵🇦',
  '1A': '🏆', '1B': '🏆', '1C': '🏆', '1D': '🏆', '1E': '🏆', '1F': '🏆', '1G': '🏆', '1H': '🏆',
  '1I': '🏆', '1J': '🏆', '1K': '🏆', '1L': '🏆',
  '2A': '🥈', '2B': '🥈', '2C': '🥈', '2D': '🥈', '2E': '🥈', '2F': '🥈', '2G': '🥈', '2H': '🥈',
  '2I': '🥈', '2J': '🥈', '2K': '🥈', '2L': '🥈',
  '3A': '⭐', '3B': '⭐', '3C': '⭐', '3D': '⭐',
  '3E': '⭐', '3F': '⭐', '3G': '⭐', '3H': '⭐',
  'W49': '⚽', 'W50': '⚽', 'W51': '⚽', 'W52': '⚽', 'W53': '⚽', 'W54': '⚽', 'W55': '⚽', 'W56': '⚽',
  'W57': '⚽', 'W58': '⚽', 'W59': '⚽', 'W60': '⚽',
  'W61': '⚽', 'W62': '⚽', 'W63': '⚽', 'W64': '⚽',
  'W65': '⚽', 'W66': '⚽', 'W67': '⚽', 'W68': '⚽',
  'W69': '🏆', 'W70': '🏆',
  'L69': '🥉', 'L70': '🥉',
}

export default function SchedulePage() {
  const { t, tTeam } = useI18n()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pb-16 md:pb-0">
      <FootballTopBar />

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

          {/* AI Smart Predictions Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">🧠 {t('pred.title')}</h2>
            </div>
            <MatchPredictionCard />
          </section>

          {/* Ad - High visibility between predictions and schedule */}
          <div className="mb-8">
            <DynamicAdBanner teamId="worldcup" teamName="World Cup 2026" teamFlag="🏆" variant="inline" />
          </div>

          <section id="group-stage" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">{t('schedule.groupStage')}</h2>
              <span className="text-slate-400 text-sm">{t('common.juneDate')}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((group) => (
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
                        <div className="flex justify-end mt-2">
                          <InlinePrediction
                            matchId={`group-${group}-${match.team1}-${match.team2}`}
                            homeTeam={t(`teams.${match.team1}`)}
                            awayTeam={t(`teams.${match.team2}`)}
                          />
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
      <MobileBottomNav />
    </div>
  )
}

function getGroupMatches(group: string) {
  const allMatches: Record<string, Array<{team1: string, team2: string, date: string, time: string, venue: string, day: string}>> = {
    'A': [
      { team1: 'MEX', team2: 'KOR', date: '2026-06-11', time: '16:00', venue: 'SoFi Stadium', day: 'Thu' },
      { team1: 'CZE', team2: 'RSA', date: '2026-06-11', time: '18:00', venue: 'MetLife Stadium', day: 'Thu' },
      { team1: 'MEX', team2: 'CZE', date: '2026-06-16', time: '18:00', venue: 'AT&T Stadium', day: 'Tue' },
      { team1: 'KOR', team2: 'RSA', date: '2026-06-17', time: '15:00', venue: 'NRG Stadium', day: 'Wed' },
      { team1: 'MEX', team2: 'RSA', date: '2026-06-21', time: '21:00', venue: 'Rose Bowl', day: 'Sun' },
      { team1: 'KOR', team2: 'CZE', date: '2026-06-22', time: '18:00', venue: 'Lincoln Financial Field', day: 'Mon' },
    ],
    'B': [
      { team1: 'CAN', team2: 'BIH', date: '2026-06-12', time: '18:00', venue: 'Levi Stadium', day: 'Fri' },
      { team1: 'QAT', team2: 'SUI', date: '2026-06-12', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Fri' },
      { team1: 'CAN', team2: 'QAT', date: '2026-06-17', time: '18:00', venue: 'SoFi Stadium', day: 'Wed' },
      { team1: 'BIH', team2: 'SUI', date: '2026-06-18', time: '15:00', venue: 'MetLife Stadium', day: 'Thu' },
      { team1: 'CAN', team2: 'SUI', date: '2026-06-22', time: '21:00', venue: 'Rose Bowl', day: 'Mon' },
      { team1: 'BIH', team2: 'QAT', date: '2026-06-23', time: '15:00', venue: 'NRG Stadium', day: 'Tue' },
    ],
    'C': [
      { team1: 'BRA', team2: 'MAR', date: '2026-06-13', time: '20:00', venue: 'AT&T Stadium', day: 'Sat' },
      { team1: 'HAI', team2: 'SCO', date: '2026-06-13', time: '18:00', venue: 'Lincoln Financial Field', day: 'Sat' },
      { team1: 'BRA', team2: 'HAI', date: '2026-06-18', time: '18:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
      { team1: 'MAR', team2: 'SCO', date: '2026-06-19', time: '15:00', venue: 'SoFi Stadium', day: 'Fri' },
      { team1: 'BRA', team2: 'SCO', date: '2026-06-23', time: '18:00', venue: 'Levi Stadium', day: 'Tue' },
      { team1: 'MAR', team2: 'HAI', date: '2026-06-24', time: '15:00', venue: 'MetLife Stadium', day: 'Wed' },
    ],
    'D': [
      { team1: 'USA', team2: 'PAR', date: '2026-06-12', time: '20:00', venue: 'SoFi Stadium', day: 'Fri' },
      { team1: 'AUS', team2: 'TUR', date: '2026-06-14', time: '18:00', venue: 'Levi Stadium', day: 'Sun' },
      { team1: 'USA', team2: 'AUS', date: '2026-06-18', time: '21:00', venue: 'NRG Stadium', day: 'Thu' },
      { team1: 'PAR', team2: 'TUR', date: '2026-06-19', time: '21:00', venue: 'AT&T Stadium', day: 'Fri' },
      { team1: 'USA', team2: 'TUR', date: '2026-06-23', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Tue' },
      { team1: 'PAR', team2: 'AUS', date: '2026-06-24', time: '18:00', venue: 'Rose Bowl', day: 'Wed' },
    ],
    'E': [
      { team1: 'GER', team2: 'CUW', date: '2026-06-14', time: '21:00', venue: 'MetLife Stadium', day: 'Sun' },
      { team1: 'ECU', team2: 'CIV', date: '2026-06-15', time: '18:00', venue: 'Lincoln Financial Field', day: 'Mon' },
      { team1: 'GER', team2: 'ECU', date: '2026-06-19', time: '18:00', venue: 'NRG Stadium', day: 'Fri' },
      { team1: 'CUW', team2: 'CIV', date: '2026-06-20', time: '15:00', venue: 'SoFi Stadium', day: 'Sat' },
      { team1: 'GER', team2: 'CIV', date: '2026-06-24', time: '21:00', venue: 'AT&T Stadium', day: 'Wed' },
      { team1: 'CUW', team2: 'ECU', date: '2026-06-25', time: '15:00', venue: 'Levi Stadium', day: 'Thu' },
    ],
    'F': [
      { team1: 'NED', team2: 'JPN', date: '2026-06-14', time: '18:00', venue: 'Rose Bowl', day: 'Sun' },
      { team1: 'SWE', team2: 'TUN', date: '2026-06-15', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Mon' },
      { team1: 'NED', team2: 'SWE', date: '2026-06-20', time: '18:00', venue: 'AT&T Stadium', day: 'Sat' },
      { team1: 'JPN', team2: 'TUN', date: '2026-06-21', time: '15:00', venue: 'Lincoln Financial Field', day: 'Sun' },
      { team1: 'NED', team2: 'TUN', date: '2026-06-25', time: '18:00', venue: 'MetLife Stadium', day: 'Thu' },
      { team1: 'JPN', team2: 'SWE', date: '2026-06-26', time: '15:00', venue: 'SoFi Stadium', day: 'Fri' },
    ],
    'G': [
      { team1: 'BEL', team2: 'EGY', date: '2026-06-15', time: '15:00', venue: 'NRG Stadium', day: 'Mon' },
      { team1: 'IRN', team2: 'NZL', date: '2026-06-16', time: '18:00', venue: 'Rose Bowl', day: 'Tue' },
      { team1: 'BEL', team2: 'IRN', date: '2026-06-20', time: '21:00', venue: 'Levi Stadium', day: 'Sat' },
      { team1: 'EGY', team2: 'NZL', date: '2026-06-21', time: '18:00', venue: 'MetLife Stadium', day: 'Sun' },
      { team1: 'BEL', team2: 'NZL', date: '2026-06-25', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
      { team1: 'EGY', team2: 'IRN', date: '2026-06-26', time: '18:00', venue: 'AT&T Stadium', day: 'Fri' },
    ],
    'H': [
      { team1: 'ESP', team2: 'CPV', date: '2026-06-13', time: '15:00', venue: 'AT&T Stadium', day: 'Sat' },
      { team1: 'KSA', team2: 'URU', date: '2026-06-14', time: '15:00', venue: 'NRG Stadium', day: 'Sun' },
      { team1: 'ESP', team2: 'KSA', date: '2026-06-18', time: '15:00', venue: 'MetLife Stadium', day: 'Thu' },
      { team1: 'CPV', team2: 'URU', date: '2026-06-19', time: '18:00', venue: 'Lincoln Financial Field', day: 'Fri' },
      { team1: 'ESP', team2: 'URU', date: '2026-06-23', time: '18:00', venue: 'SoFi Stadium', day: 'Tue' },
      { team1: 'CPV', team2: 'KSA', date: '2026-06-24', time: '15:00', venue: 'Levi Stadium', day: 'Wed' },
    ],
    'I': [
      { team1: 'FRA', team2: 'SEN', date: '2026-06-11', time: '21:00', venue: 'Rose Bowl', day: 'Thu' },
      { team1: 'IRQ', team2: 'NOR', date: '2026-06-12', time: '15:00', venue: 'Levi Stadium', day: 'Fri' },
      { team1: 'FRA', team2: 'IRQ', date: '2026-06-16', time: '15:00', venue: 'Mercedes-Benz Stadium', day: 'Tue' },
      { team1: 'SEN', team2: 'NOR', date: '2026-06-17', time: '21:00', venue: 'SoFi Stadium', day: 'Wed' },
      { team1: 'FRA', team2: 'NOR', date: '2026-06-21', time: '18:00', venue: 'AT&T Stadium', day: 'Sun' },
      { team1: 'SEN', team2: 'IRQ', date: '2026-06-22', time: '15:00', venue: 'NRG Stadium', day: 'Mon' },
    ],
    'J': [
      { team1: 'ARG', team2: 'ALG', date: '2026-06-11', time: '18:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
      { team1: 'AUT', team2: 'JOR', date: '2026-06-12', time: '18:00', venue: 'AT&T Stadium', day: 'Fri' },
      { team1: 'ARG', team2: 'AUT', date: '2026-06-16', time: '21:00', venue: 'NRG Stadium', day: 'Tue' },
      { team1: 'ALG', team2: 'JOR', date: '2026-06-17', time: '18:00', venue: 'Lincoln Financial Field', day: 'Wed' },
      { team1: 'ARG', team2: 'JOR', date: '2026-06-22', time: '18:00', venue: 'MetLife Stadium', day: 'Mon' },
      { team1: 'ALG', team2: 'AUT', date: '2026-06-23', time: '15:00', venue: 'SoFi Stadium', day: 'Tue' },
    ],
    'K': [
      { team1: 'POR', team2: 'COD', date: '2026-06-13', time: '21:00', venue: 'NRG Stadium', day: 'Sat' },
      { team1: 'UZB', team2: 'COL', date: '2026-06-14', time: '15:00', venue: 'SoFi Stadium', day: 'Sun' },
      { team1: 'POR', team2: 'UZB', date: '2026-06-19', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Fri' },
      { team1: 'COD', team2: 'COL', date: '2026-06-20', time: '18:00', venue: 'NRG Stadium', day: 'Sat' },
      { team1: 'POR', team2: 'COL', date: '2026-06-24', time: '18:00', venue: 'MetLife Stadium', day: 'Wed' },
      { team1: 'COD', team2: 'UZB', date: '2026-06-25', time: '15:00', venue: 'Rose Bowl', day: 'Thu' },
    ],
    'L': [
      { team1: 'ENG', team2: 'CRO', date: '2026-06-11', time: '15:00', venue: 'AT&T Stadium', day: 'Thu' },
      { team1: 'GHA', team2: 'PAN', date: '2026-06-13', time: '15:00', venue: 'SoFi Stadium', day: 'Sat' },
      { team1: 'ENG', team2: 'GHA', date: '2026-06-17', time: '15:00', venue: 'Rose Bowl', day: 'Wed' },
      { team1: 'CRO', team2: 'PAN', date: '2026-06-18', time: '21:00', venue: 'AT&T Stadium', day: 'Thu' },
      { team1: 'ENG', team2: 'PAN', date: '2026-06-22', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Mon' },
      { team1: 'CRO', team2: 'GHA', date: '2026-06-23', time: '18:00', venue: 'Lincoln Financial Field', day: 'Tue' },
    ],
  }
  return allMatches[group] || []
}

function getKnockoutMatches(stage: string) {
  const knockouts: Record<string, Array<{team1: string, team2: string, date: string, time: string, venue: string}>> = {
    'roundOf16': [
      { team1: '1A', team2: '2B', date: '2026-06-28', time: '16:00', venue: 'Mercedes-Benz Stadium' },
      { team1: '1C', team2: '2D', date: '2026-06-28', time: '19:00', venue: 'SoFi Stadium' },
      { team1: '1E', team2: '2F', date: '2026-06-28', time: '21:00', venue: 'AT&T Stadium' },
      { team1: '1G', team2: '2H', date: '2026-06-29', time: '16:00', venue: 'NRG Stadium' },
      { team1: '1I', team2: '2J', date: '2026-06-29', time: '19:00', venue: 'MetLife Stadium' },
      { team1: '1K', team2: '2L', date: '2026-06-29', time: '21:00', venue: 'Levi Stadium' },
      { team1: '1B', team2: '2A', date: '2026-06-30', time: '16:00', venue: 'Lincoln Financial Field' },
      { team1: '1D', team2: '2C', date: '2026-06-30', time: '19:00', venue: 'Rose Bowl' },
      { team1: '1F', team2: '2E', date: '2026-07-01', time: '16:00', venue: 'Hard Rock Stadium' },
      { team1: '1H', team2: '2G', date: '2026-07-01', time: '19:00', venue: 'Lamar Hunt US Bank Stadium' },
      { team1: '1J', team2: '2I', date: '2026-07-01', time: '21:00', venue: 'SoFi Stadium' },
      { team1: '1L', team2: '2K', date: '2026-07-02', time: '16:00', venue: 'Mercedes-Benz Stadium' },
      { team1: '3A', team2: '3B', date: '2026-07-02', time: '19:00', venue: 'AT&T Stadium' },
      { team1: '3C', team2: '3D', date: '2026-07-02', time: '21:00', venue: 'NRG Stadium' },
      { team1: '3E', team2: '3F', date: '2026-07-03', time: '16:00', venue: 'MetLife Stadium' },
      { team1: '3G', team2: '3H', date: '2026-07-03', time: '19:00', venue: 'Levi Stadium' },
    ],
    'quarterFinals': [
      { team1: 'W49', team2: 'W50', date: '2026-07-05', time: '16:00', venue: 'Mercedes-Benz Stadium' },
      { team1: 'W51', team2: 'W52', date: '2026-07-05', time: '19:00', venue: 'SoFi Stadium' },
      { team1: 'W53', team2: 'W54', date: '2026-07-06', time: '16:00', venue: 'AT&T Stadium' },
      { team1: 'W55', team2: 'W56', date: '2026-07-06', time: '19:00', venue: 'NRG Stadium' },
      { team1: 'W57', team2: 'W58', date: '2026-07-07', time: '16:00', venue: 'MetLife Stadium' },
      { team1: 'W59', team2: 'W60', date: '2026-07-07', time: '19:00', venue: 'SoFi Stadium' },
      { team1: 'W61', team2: 'W62', date: '2026-07-08', time: '16:00', venue: 'Rose Bowl' },
      { team1: 'W63', team2: 'W64', date: '2026-07-08', time: '19:00', venue: 'Lincoln Financial Field' },
    ],
    'semiFinals': [
      { team1: 'W65', team2: 'W66', date: '2026-07-11', time: '18:00', venue: 'MetLife Stadium' },
      { team1: 'W67', team2: 'W68', date: '2026-07-12', time: '18:00', venue: 'SoFi Stadium' },
    ],
    'final': [
      { team1: 'W69', team2: 'W70', date: '2026-07-19', time: '18:00', venue: 'Hard Rock Stadium' },
    ],
    'thirdPlace': [
      { team1: 'L69', team2: 'L70', date: '2026-07-18', time: '16:00', venue: 'Mercedes-Benz Stadium' },
    ],
  }
  return knockouts[stage] || []
}
