'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import type { Team } from '@/libs/types'

interface TeamsPageContentProps {
  allTeams: Team[]
}

const GROUP_LETTERS = 'ABCDEFGHIJKL'.split('')

export default function TeamsPageContent({ allTeams }: TeamsPageContentProps) {
  const { t, tTeam } = useI18n()
  const [searchTerm, setSearchTerm] = useState('')

  const teamsByGroup = GROUP_LETTERS.reduce((acc, letter) => {
    acc[letter] = allTeams.filter(t => t.group === `Group ${letter}`)
    return acc
  }, {} as Record<string, typeof allTeams>)

  const filteredTeams = searchTerm
    ? allTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.shortName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 text-slate-400 hover:text-white transition-colors">
            ← {t('nav.backToTown')}
          </Link>
          <h1 className="text-5xl font-bold mb-4">
            🏆 {t('teamMatrix.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            {t('teamMatrix.clickToView')}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder={t('teamMatrix.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </header>

        {searchTerm && filteredTeams.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">🔍 {t('teamMatrix.noResults')}: "{searchTerm}"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTeams.map(team => (
                <Link
                  key={team.id}
                  href={`/team-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{team.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate group-hover:text-amber-400 transition-colors">
                        {tTeam(team.id)}
                      </div>
                      <div className="text-xs text-slate-400">{team.shortName} · {team.group}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {searchTerm && filteredTeams.length === 0 && (
          <section className="mb-12 text-center">
            <p className="text-slate-400">{t('teamMatrix.noResults')} "{searchTerm}"</p>
            <p className="text-slate-500 text-sm mt-2">{t('teamMatrix.trySearching')}</p>
          </section>
        )}

        {!searchTerm && (
          <>
            <nav className="flex flex-wrap justify-center gap-2 mb-8">
              {GROUP_LETTERS.map(letter => (
                <a
                  key={letter}
                  href={`#group-${letter}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm transition-colors"
                >
                  {t('schedule.group')} {letter}
                </a>
              ))}
            </nav>

            {GROUP_LETTERS.map(letter => {
              const teams = teamsByGroup[letter]
              if (!teams || teams.length === 0) return null

              return (
                <section key={letter} id={`group-${letter}`} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-10 h-10 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center text-amber-400">
                      {letter}
                    </span>
                    {t('schedule.group')} {letter}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {teams.map(team => (
                      <Link
                        key={team.id}
                        href={`/team-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/50 hover:border-amber-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{team.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg truncate group-hover:text-amber-400 transition-colors">
                              {tTeam(team.id)}
                            </div>
                            <div className="text-xs text-slate-400">{team.shortName}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                            {t('teamsHub.viewAll')} →
                          </span>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                            H2H →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {teams.map(team => (
                      <Link
                        key={team.id}
                        href={`/h2h-${teams[0].shortName.toLowerCase()}-vs-${team.shortName.toLowerCase()}`}
                        className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        {teams[0].shortName} vs {team.shortName}
                        {team !== teams[teams.length - 1] && ' • '}
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}

            <section className="mt-16 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">🤖 {t('prediction.title')}</h2>
              <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                {t('prediction.disclaimer')}
              </p>
              <Link
                href="/h2h-argentina-vs-brazil"
                className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-8 py-3 rounded-full hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                🔮 {t('prediction.aiOracle')}
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
