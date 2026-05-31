'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

interface Team {
  id: string
  name: string
  code: string
  continent: string
  flag: string
  ranking: number
  coach: string
  keyPlayers: string[]
  worldCupTitles: number
  bestResult: string
  lastAppearance: string
}

const teams: Team[] = [
  {
    id: 'argentina',
    name: 'Argentina',
    code: 'ARG',
    continent: 'South America',
    flag: '🇦🇷',
    ranking: 1,
    coach: 'Lionel Scaloni',
    keyPlayers: ['Messi', 'Di Maria', 'Martinez'],
    worldCupTitles: 3,
    bestResult: 'Champion (1978, 1986, 2022)',
    lastAppearance: '2022',
  },
  {
    id: 'brazil',
    name: 'Brazil',
    code: 'BRA',
    continent: 'South America',
    flag: '🇧🇷',
    ranking: 3,
    coach: 'Dorival Jr.',
    keyPlayers: ['Neymar', 'Vinicius Jr.', 'Rodri'],
    worldCupTitles: 5,
    bestResult: 'Champion (1958, 1962, 1970, 1994, 2002)',
    lastAppearance: '2022',
  },
  {
    id: 'france',
    name: 'France',
    code: 'FRA',
    continent: 'Europe',
    flag: '🇫🇷',
    ranking: 2,
    coach: 'Didier Deschamps',
    keyPlayers: ['Mbappe', '姆巴佩', 'Kante'],
    worldCupTitles: 2,
    bestResult: 'Champion (1998, 2018)',
    lastAppearance: '2022',
  },
  {
    id: 'england',
    name: 'England',
    code: 'ENG',
    continent: 'Europe',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    ranking: 5,
    coach: 'Gareth Southgate',
    keyPlayers: ['Kane', 'Rice', 'Foden'],
    worldCupTitles: 1,
    bestResult: 'Champion (1966)',
    lastAppearance: '2022',
  },
  {
    id: 'usa',
    name: 'USA',
    code: 'USA',
    continent: 'North America',
    flag: '🇺🇸',
    ranking: 11,
    coach: 'Gregg Berhalter',
    keyPlayers: ['Pulisic', 'Reyna', 'McKennie'],
    worldCupTitles: 0,
    bestResult: 'Quarter-finals (2002)',
    lastAppearance: '2022',
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'GER',
    continent: 'Europe',
    flag: '🇩🇪',
    ranking: 16,
    coach: 'Julian Nagelsmann',
    keyPlayers: ['Neuer', 'Kroos', 'Havertz'],
    worldCupTitles: 4,
    bestResult: 'Champion (1954, 1974, 1990, 2014)',
    lastAppearance: '2022',
  },
  {
    id: 'spain',
    name: 'Spain',
    code: 'ESP',
    continent: 'Europe',
    flag: '🇪🇸',
    ranking: 8,
    coach: 'Luis de la Fuente',
    keyPlayers: ['Rodri', 'Gavi', 'Morata'],
    worldCupTitles: 1,
    bestResult: 'Champion (2010)',
    lastAppearance: '2022',
  },
  {
    id: 'portugal',
    name: 'Portugal',
    code: 'POR',
    continent: 'Europe',
    flag: '🇵🇹',
    ranking: 6,
    coach: 'Roberto Martinez',
    keyPlayers: ['Ronaldo', 'B.Silva', 'Fernandes'],
    worldCupTitles: 0,
    bestResult: 'Semi-finals (1966, 2006)',
    lastAppearance: '2022',
  },
  {
    id: 'morocco',
    name: 'Morocco',
    code: 'MAR',
    continent: 'Africa',
    flag: '🇲🇦',
    ranking: 13,
    coach: 'Walid Regragui',
    keyPlayers: ['Hakimi', 'Ziyech', 'AitmJbt'],
    worldCupTitles: 0,
    bestResult: 'Semi-finals (2022)',
    lastAppearance: '2022',
  },
  {
    id: 'croatia',
    name: 'Croatia',
    code: 'CRO',
    continent: 'Europe',
    flag: '🇭🇷',
    ranking: 9,
    coach: 'Zlatko Dalic',
    keyPlayers: ['Modric', 'Kovacic', 'Perisic'],
    worldCupTitles: 0,
    bestResult: 'Final (2018)',
    lastAppearance: '2022',
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    code: 'NED',
    continent: 'Europe',
    flag: '🇳🇱',
    ranking: 7,
    coach: 'Ronald Koeman',
    keyPlayers: ['van Dijk', 'de Jong', 'Depay'],
    worldCupTitles: 0,
    bestResult: 'Final (1974, 1988, 2022)',
    lastAppearance: '2022',
  },
  {
    id: 'japan',
    name: 'Japan',
    code: 'JPN',
    continent: 'Asia',
    flag: '🇯🇵',
    ranking: 18,
    coach: 'Hajime Moriyasu',
    keyPlayers: ['Kamada', 'Minamino', 'Tomiyasu'],
    worldCupTitles: 0,
    bestResult: 'Round of 16 (2018, 2022)',
    lastAppearance: '2022',
  },
]

export default function TeamsHub() {
  const { t, tTeam } = useI18n()
  const [selectedContinent, setSelectedContinent] = useState('All')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const continents = [
    { key: 'All', label: t('teamsHub.all') },
    { key: 'Europe', label: t('teamsHub.europe') },
    { key: 'South America', label: t('teamsHub.southAmerica') },
    { key: 'North America', label: t('teamsHub.northAmerica') },
    { key: 'Africa', label: t('teamsHub.africa') },
    { key: 'Asia', label: t('teamsHub.asia') }
  ]

  const filteredTeams = selectedContinent === 'All'
    ? teams
    : teams.filter(t => t.continent === selectedContinent)

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="text-xl">🌍</span>
        {t('teamsHub.title')}
      </h2>

      {/* Continent Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {continents.map((continent) => (
          <button
            key={continent.key}
            onClick={() => setSelectedContinent(continent.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              selectedContinent === continent.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-transparent hover:text-white'
            }`}
          >
            {continent.label}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {filteredTeams.map((team) => (
          <Link
            key={team.id}
            href={`/football/teams/${team.id}`}
            className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
              selectedTeam?.id === team.id
                ? 'bg-cyan-500/20 border-cyan-500/50'
                : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl mb-1">{team.flag}</div>
            <div className="text-[10px] font-medium text-slate-300 truncate">{t(`teams.${team.code}`)}</div>
          </Link>
        ))}
      </div>

      {/* Team Detail Card */}
      {selectedTeam && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{selectedTeam.flag}</div>
            <div>
              <h3 className="text-white font-bold text-lg">{tTeam(selectedTeam.code)}</h3>
              <p className="text-slate-400 text-sm">{t('team.fifaRank')}: #{selectedTeam.ranking}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">{t('teamsHub.headCoach')}</p>
              <p className="text-white font-medium">{selectedTeam.coach}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">{t('teamsHub.worldCupTitles')}</p>
              <p className="text-amber-400 font-bold">{selectedTeam.worldCupTitles} 🏆</p>
            </div>
          </div>

          <div className="mt-3 bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-500 text-xs mb-2">{t('teamsHub.keyPlayers')}</p>
            <div className="flex flex-wrap gap-1">
              {selectedTeam.keyPlayers.map((player, idx) => (
                <span key={idx} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {player}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-500 text-xs mb-1">{t('teamsHub.bestResult')}</p>
            <p className="text-white text-sm">{selectedTeam.bestResult}</p>
          </div>
        </div>
      )}

      {filteredTeams.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-4xl mb-2">🔍</p>
          <p>{t('teamsHub.noTeams')}</p>
        </div>
      )}
    </div>
  )
}
