'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { teamFlags, getGroupMatches, getKnockoutMatches } from '@/libs/data/worldcup-schedule'
import FootballTopBar from '@/components/football/FootballTopBar'
import MobileBottomNav from '@/components/football/MobileBottomNav'
import PageTransition from '@/components/ui/PageTransition'
import MatchPredictionCard from '@/components/football/MatchPredictionCard'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import InlinePrediction from '@/components/football/InlinePrediction'

export default function SchedulePage() {
  const { t, tTeam } = useI18n()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pb-16 md:pb-0">
      <PageTransition>
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
      </PageTransition>
      <MobileBottomNav />
    </div>
  )
}


