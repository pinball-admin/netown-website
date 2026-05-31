'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

interface Team {
  id: string
  name: string
  flag: string
  code: string
}

const allTeams: Team[] = [
  { id: 'argentina', name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', code: 'AUS' },
  { id: 'austria', name: 'Austria', flag: '🇦🇹', code: 'AUT' },
  { id: 'belgium', name: 'Belgium', flag: '🇧🇪', code: 'BEL' },
  { id: 'brazil', name: 'Brazil', flag: '🇧🇷', code: 'BRA' },
  { id: 'cameroon', name: 'Cameroon', flag: '🇨🇲', code: 'CAM' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', code: 'CAN' },
  { id: 'chile', name: 'Chile', flag: '🇨🇱', code: 'CHI' },
  { id: 'colombia', name: 'Colombia', flag: '🇨🇴', code: 'COL' },
  { id: 'costa-rica', name: 'Costa Rica', flag: '🇨🇷', code: 'CRC' },
  { id: 'croatia', name: 'Croatia', flag: '🇭🇷', code: 'CRO' },
  { id: 'denmark', name: 'Denmark', flag: '🇩🇰', code: 'DEN' },
  { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
  { id: 'egypt', name: 'Egypt', flag: '🇪🇬', code: 'EGY' },
  { id: 'england', name: 'England', flag: '🏴', code: 'ENG' },
  { id: 'france', name: 'France', flag: '🇫🇷', code: 'FRA' },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', code: 'GER' },
  { id: 'ghana', name: 'Ghana', flag: '🇬🇭', code: 'GHA' },
  { id: 'iceland', name: 'Iceland', flag: '🇮🇸', code: 'ISL' },
  { id: 'iran', name: 'Iran', flag: '🇮🇷', code: 'IRN' },
  { id: 'italy', name: 'Italy', flag: '🇮🇹', code: 'ITA' },
  { id: 'jamaica', name: 'Jamaica', flag: '🇯🇲', code: 'JAM' },
  { id: 'japan', name: 'Japan', flag: '🇯🇵', code: 'JPN' },
  { id: 'mexico', name: 'Mexico', flag: '🇲🇽', code: 'MEX' },
  { id: 'morocco', name: 'Morocco', flag: '🇲🇦', code: 'MAR' },
  { id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿', code: 'NZL' },
  { id: 'nigeria', name: 'Nigeria', flag: '🇳🇬', code: 'NGA' },
  { id: 'norway', name: 'Norway', flag: '🇳🇴', code: 'NOR' },
  { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱', code: 'NED' },
  { id: 'panama', name: 'Panama', flag: '🇵🇦', code: 'PAN' },
  { id: 'paraguay', name: 'Paraguay', flag: '🇵🇾', code: 'PAR' },
  { id: 'peru', name: 'Peru', flag: '🇵🇪', code: 'PER' },
  { id: 'poland', name: 'Poland', flag: '🇵🇱', code: 'POL' },
  { id: 'portugal', name: 'Portugal', flag: '🇵🇹', code: 'POR' },
  { id: 'qatar', name: 'Qatar', flag: '🇶🇦', code: 'QAT' },
  { id: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦', code: 'KSA' },
  { id: 'scotland', name: 'Scotland', flag: '🏴', code: 'SCO' },
  { id: 'senegal', name: 'Senegal', flag: '🇸🇳', code: 'SEN' },
  { id: 'serbia', name: 'Serbia', flag: '🇷🇸', code: 'SRB' },
  { id: 'south-korea', name: 'South Korea', flag: '🇰🇷', code: 'KOR' },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', code: 'ESP' },
  { id: 'sweden', name: 'Sweden', flag: '🇸🇪', code: 'SWE' },
  { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭', code: 'SUI' },
  { id: 'uae', name: 'UAE', flag: '🇦🇪', code: 'UAE' },
  { id: 'ukraine', name: 'Ukraine', flag: '🇺🇦', code: 'UKR' },
  { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾', code: 'URU' },
  { id: 'usa', name: 'USA', flag: '🇺🇸', code: 'USA' },
  { id: 'venezuela', name: 'Venezuela', flag: '🇻🇪', code: 'VEN' },
  { id: 'wales', name: 'Wales', flag: '🏴', code: 'WAL' },
  { id: 'algeria', name: 'Algeria', flag: '🇩🇿', code: 'ALG' },
]

const teamsByLetter = (teams: Team[]): Record<string, Team[]> => {
  return teams.reduce((acc, team) => {
    const letter = team.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(team)
    return acc
  }, {} as Record<string, Team[]>)
}

export default function TeamMatrix() {
  const { t, tTeam } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return allTeams
    const query = searchQuery.toLowerCase()
    return allTeams.filter(
      team => team.name.toLowerCase().includes(query) || team.code.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const groupedTeams = useMemo(() => teamsByLetter(filteredTeams), [filteredTeams])
  const letters = Object.keys(groupedTeams).sort()

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t('teamMatrix.title')}
        </h2>
        <span className="text-sm text-slate-400">{filteredTeams.length} {t('teamMatrix.teams')}</span>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <span className="text-slate-400 text-lg">🔍</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('teamMatrix.searchPlaceholder')}
          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {searchQuery && filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-2">{t('teamMatrix.noResults')} "{searchQuery}"</p>
          <p className="text-slate-500 text-sm">{t('teamMatrix.trySearching')}</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {letters.map(letter => (
            <div key={letter} className="mb-4">
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm py-1 mb-2">
                <span className="text-lg font-bold text-emerald-400">{letter}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {groupedTeams[letter].map(team => (
                  <Link
                    key={team.id}
                    href={`/football/teams/${team.id}`}
                    className="group flex items-center gap-2 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-emerald-500/30 rounded-lg px-3 py-2 transition-all duration-200"
                  >
                    <span className="text-xl">{team.flag}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-emerald-300 transition-colors">
                        {tTeam(team.code)}
                      </p>
                      <p className="text-slate-500 text-xs">{team.code}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('teamMatrix.clickToView')}
          </p>
        </div>
      )}
    </div>
  )
}
