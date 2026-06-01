'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import AIExpertsCard from '@/components/AIExpertsCard'
import { H2HJsonLd } from '@/components/JsonLd'
import type { TeamStats } from '@/libs/types'

interface H2HPageContentProps {
  homeTeam: TeamStats
  awayTeam: TeamStats
}

export default function H2HPageContent({ homeTeam, awayTeam }: H2HPageContentProps) {
  const { t, tTeam } = useI18n()

  // 模拟H2H数据
  const h2hStats = {
    totalMatches: 28,
    homeWins: 12,
    awayWins: 8,
    draws: 8,
    homeGoals: 45,
    awayGoals: 32,
  }

  const recentMatches = [
    { date: '2022-12-18', homeGoals: 3, awayGoals: 3, winner: 'Draw', stage: 'World Cup Final' },
    { date: '2021-06-14', homeGoals: 1, awayGoals: 0, winner: homeTeam.shortName, stage: 'Friendship' },
    { date: '2018-06-26', homeGoals: 2, awayGoals: 1, winner: awayTeam.shortName, stage: 'World Cup' },
    { date: '2017-11-10', homeGoals: 0, awayGoals: 0, winner: 'Draw', stage: 'Friendship' },
    { date: '2014-07-09', homeGoals: 1, awayGoals: 7, winner: awayTeam.shortName, stage: 'World Cup Semi' },
  ]

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <H2HJsonLd
        homeTeam={homeTeam.name}
        awayTeam={awayTeam.name}
        description={`Head-to-head statistics and AI predictions for ${homeTeam.name} vs ${awayTeam.name}. View comprehensive match analysis and expert predictions.`}
        url={`https://football.netown.cn/h2h-${homeTeam.name.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam.name.toLowerCase().replace(/\s+/g, '-')}`}
        expertPredictions={[
          { expertName: 'NeuralNetMaster', prediction: 'Home Win', confidence: 72 },
          { expertName: 'StatisticalGenius', prediction: 'Draw', confidence: 45 },
          { expertName: 'HistorianBot', prediction: 'Away Win', confidence: 38 },
        ]}
        communityStats={{
          totalPredictions: 1250,
          homeWinPercentage: 45,
          drawPercentage: 28,
          awayWinPercentage: 27
        }}
      />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <nav className="mb-8">
          <Link href="/teams" className="text-slate-400 hover:text-white transition-colors">
            ← {t('team.backToHub')}
          </Link>
        </nav>

        <header className="mb-12">
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">{homeTeam.flag}</div>
              <h2 className="text-3xl font-bold">{tTeam(homeTeam.id)}</h2>
              <div className="text-slate-400 text-sm mt-1">{homeTeam.shortName}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400 mb-2">VS</div>
              <div className="text-slate-500 text-sm">H2H History</div>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">{awayTeam.flag}</div>
              <h2 className="text-3xl font-bold">{tTeam(awayTeam.id)}</h2>
              <div className="text-slate-400 text-sm mt-1">{awayTeam.shortName}</div>
            </div>
          </div>
        </header>

        {/* H2H Stats */}
        <section className="mb-12">
          <h3 className="text-xl font-bold mb-6">📊 {t('team.worldCupHistory')}</h3>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{h2hStats.totalMatches}</div>
                <div className="text-slate-400 text-sm">Total Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">{h2hStats.homeWins}</div>
                <div className="text-slate-400 text-sm">{tTeam(homeTeam.id)} Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">{h2hStats.draws}</div>
                <div className="text-slate-400 text-sm">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">{h2hStats.awayWins}</div>
                <div className="text-slate-400 text-sm">{tTeam(awayTeam.id)} Wins</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-2xl">
                <span className="text-emerald-400">{h2hStats.homeGoals}</span>
                <span className="text-slate-500 mx-2">-</span>
                <span className="text-red-400">{h2hStats.awayGoals}</span>
                <span className="text-slate-400 text-sm ml-2">Goals</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Matches */}
        <section className="mb-12">
          <h3 className="text-xl font-bold mb-6">⚽ {t('team.matchFixtures')}</h3>
          <div className="space-y-4">
            {recentMatches.map((match, i) => (
              <div
                key={i}
                className={`bg-slate-800/50 border rounded-xl p-4 ${
                  match.winner === 'Draw' 
                    ? 'border-amber-500/30' 
                    : match.winner === homeTeam.shortName 
                      ? 'border-emerald-500/30' 
                      : 'border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{homeTeam.flag}</span>
                    <div className="text-center">
                      <div className="text-xl font-bold">{match.homeGoals}</div>
                      <div className="text-sm text-slate-400">{homeTeam.shortName}</div>
                    </div>
                    <span className="text-2xl font-bold">VS</span>
                    <div className="text-center">
                      <div className="text-xl font-bold">{match.awayGoals}</div>
                      <div className="text-sm text-slate-400">{awayTeam.shortName}</div>
                    </div>
                    <span className="text-2xl">{awayTeam.flag}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      match.winner === 'Draw' 
                        ? 'text-amber-400' 
                        : match.winner === homeTeam.shortName 
                          ? 'text-emerald-400' 
                          : 'text-red-400'
                    }`}>
                      {match.winner === 'Draw' ? 'Draw' : `${match.winner} Win`}
                    </div>
                    <div className="text-sm text-slate-400">{match.stage}</div>
                    <div className="text-xs text-slate-500">{match.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Prediction */}
        <section>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🤖 {t('prediction.title')}</h3>
              <p className="text-slate-400">{t('prediction.analysis')}</p>
            </div>
            <AIExpertsCard
              matchId={`h2h-${homeTeam.shortName.toLowerCase()}-${awayTeam.shortName.toLowerCase()}`}
              homeTeam={tTeam(homeTeam.id)}
              awayTeam={tTeam(awayTeam.id)}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
