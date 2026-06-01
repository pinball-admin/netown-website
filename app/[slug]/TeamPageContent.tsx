'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import AIExpertsCard from '@/components/AIExpertsCard'
import { TeamJsonLd } from '@/components/JsonLd'
import type { TeamStats } from '@/libs/types'

interface TeamPageContentProps {
  team: TeamStats
  teamId: string
  relatedTeams: TeamStats[]
  form: string[]
  squad: Array<{ name: string; position: string; number: number }>
}

const FORM_COLORS: Record<string, string> = {
  W: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  D: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  L: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

export default function TeamPageContent({ team, teamId, relatedTeams, form, squad }: TeamPageContentProps) {
  const { t, tTeam } = useI18n()

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <TeamJsonLd
        name={team.name}
        description={`${team.name} national football team profile for World Cup 2026. View squad, stats, fixtures, and AI predictions.`}
        url={`https://football.netown.cn/team-${teamId.toLowerCase()}`}
      />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <nav className="mb-8">
          <Link href="/teams" className="text-slate-400 hover:text-white transition-colors">
            ← {t('team.backToHub')}
          </Link>
        </nav>

        <header className="mb-12 text-center">
          <div className="text-6xl mb-4">{team.flag}</div>
          <h1 className="text-5xl font-bold mb-2">{tTeam(team.id)}</h1>
          <div className="flex items-center justify-center gap-4 text-slate-400 flex-wrap">
            <span>{team.group}</span>
            <span>•</span>
            <span>{t('team.fifaRank')}: #{team.ranking || 'N/A'}</span>
            <span>•</span>
            <span>{t('team.worldCupTitles')}: {team.id === 'BRA' ? '5' : team.id === 'ARG' || team.id === 'FRA' || team.id === 'GER' ? '2' : team.id === 'URU' ? '2' : team.id === 'ENG' || team.id === 'ESP' ? '1' : '0'}</span>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">📊 {t('team.worldCupHistory')}</h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              {form.map((result, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${FORM_COLORS[result]}`}
                >
                  {result}
                </div>
              ))}
              <span className="text-slate-400 ml-4 text-sm">
                {t('team.bestResult')}: {team.id === 'BRA' ? '5 Titles' : team.id === 'ARG' ? '2 Titles (2022, 1986)' : team.id === 'GER' ? '4 Titles' : team.id === 'FRA' ? '2 Titles (2018, 1998)' : team.id === 'URU' ? '2 Titles (1930, 1950)' : team.id === 'CRO' ? '2nd Place (2018)' : team.id === 'MAR' ? '4th Place (2022)' : t('team.bestResult')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{team.stats?.won || 3}</div>
                <div className="text-slate-400">{t('team.keyPlayers')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{team.stats?.drawn || 1}</div>
                <div className="text-slate-400">{t('team.squad')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{team.stats?.lost || 1}</div>
                <div className="text-slate-400">{t('team.coach')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{team.stats?.goalsFor || 10}-{team.stats?.goalsAgainst || 5}</div>
                <div className="text-slate-400">{t('team.matchFixtures')}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">👥 {t('team.squad')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {squad.map((player, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-amber-500/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {player.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{player.name}</div>
                    <div className="text-xs text-slate-400">{player.position}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🏟️ Team Info</h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-slate-400 text-sm mb-1">Stadium</div>
                <div className="font-semibold">{team.stadium}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Capacity</div>
                <div className="font-semibold">{team.capacity?.toLocaleString() || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">{t('team.coach')}</div>
                <div className="font-semibold">{team.manager}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">{t('team.national')}</div>
                <div className="font-semibold">{tTeam(team.id)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">🤖 {t('prediction.title')}</h2>
              <p className="text-slate-400">{t('prediction.analysis')}</p>
            </div>
            <AIExpertsCard
              matchId={`team-${teamId}`}
              homeTeam={tTeam(team.id)}
              awayTeam={t('team.keyPlayers')}
            />
          </div>
        </section>

        {relatedTeams.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">⚔️ {t('team.bestResult')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedTeams.map(t => (
                <Link
                  key={t.id}
                  href={`/team-${t.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.flag}</span>
                    <div>
                      <div className="font-semibold">{tTeam(t.id)}</div>
                      <div className="text-xs text-slate-400">FIFA #{t.ranking || 'N/A'}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
