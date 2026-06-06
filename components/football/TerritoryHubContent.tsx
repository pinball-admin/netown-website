'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import LoginModal from '@/components/LoginModal'

interface TerritoryInfo {
  teamCode: string
  claimedBy: { id: string; name: string; displayName: string | null } | null
  memberCount: number
}

interface UserTerritory {
  teamCode: string
  role: 'owner' | 'member'
  memberCount: number
}

interface Team {
  code: string
  name: string
  flag: string
  continent: string
}

const CONTINENTS = ['All', 'Europe', 'South America', 'North America', 'Asia', 'Africa'] as const

const continentMap: Record<string, string> = {
  ARG: 'South America', BRA: 'South America', FRA: 'Europe', ENG: 'Europe', ESP: 'Europe', GER: 'Europe',
  NED: 'Europe', POR: 'Europe', BEL: 'Europe', URU: 'South America', CRO: 'Europe',
  COL: 'South America', MEX: 'North America', USA: 'North America', CAN: 'North America',
  JPN: 'Asia', KOR: 'Asia', IRN: 'Asia', QAT: 'Asia', AUS: 'Asia', MAR: 'Africa', SEN: 'Africa',
  GHA: 'Africa', EGY: 'Africa', ALG: 'Africa', TUN: 'Africa',
  ECU: 'South America', PAR: 'South America', SWE: 'Europe', SUI: 'Europe', AUT: 'Europe',
  NOR: 'Europe', SCO: 'Europe', TUR: 'Europe', CZE: 'Europe', KSA: 'Asia',
  NZL: 'Asia', PAN: 'North America', CUW: 'North America', HAI: 'North America',
  CIV: 'Africa', CPV: 'Africa', COD: 'Africa', IRQ: 'Asia', JOR: 'Asia', UZB: 'Asia',
  RSA: 'Africa', BIH: 'Europe',
}

const ALL_TEAMS: Team[] = [
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', continent: 'North America' },
  { code: 'KOR', name: 'South Korea', flag: '🇰🇷', continent: 'Asia' },
  { code: 'CZE', name: 'Czech Republic', flag: '🇨🇿', continent: 'Europe' },
  { code: 'RSA', name: 'South Africa', flag: '🇿🇦', continent: 'Africa' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦', continent: 'North America' },
  { code: 'BIH', name: 'Bosnia', flag: '🇧🇦', continent: 'Europe' },
  { code: 'QAT', name: 'Qatar', flag: '🇶🇦', continent: 'Asia' },
  { code: 'SUI', name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', continent: 'South America' },
  { code: 'MAR', name: 'Morocco', flag: '🇲🇦', continent: 'Africa' },
  { code: 'HAI', name: 'Haiti', flag: '🇭🇹', continent: 'North America' },
  { code: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', continent: 'Europe' },
  { code: 'USA', name: 'United States', flag: '🇺🇸', continent: 'North America' },
  { code: 'PAR', name: 'Paraguay', flag: '🇵🇾', continent: 'South America' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', continent: 'Asia' },
  { code: 'TUR', name: 'Turkey', flag: '🇹🇷', continent: 'Europe' },
  { code: 'GER', name: 'Germany', flag: '🇩🇪', continent: 'Europe' },
  { code: 'CUW', name: 'Curacao', flag: '🇨🇼', continent: 'North America' },
  { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', continent: 'South America' },
  { code: 'CIV', name: 'Ivory Coast', flag: '🇨🇮', continent: 'Africa' },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵', continent: 'Asia' },
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪', continent: 'Europe' },
  { code: 'TUN', name: 'Tunisia', flag: '🇹🇳', continent: 'Africa' },
  { code: 'BEL', name: 'Belgium', flag: '🇧🇪', continent: 'Europe' },
  { code: 'EGY', name: 'Egypt', flag: '🇪🇬', continent: 'Africa' },
  { code: 'IRN', name: 'Iran', flag: '🇮🇷', continent: 'Asia' },
  { code: 'NZL', name: 'New Zealand', flag: '🇳🇿', continent: 'Asia' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸', continent: 'Europe' },
  { code: 'CPV', name: 'Cape Verde', flag: '🇨🇻', continent: 'Africa' },
  { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Asia' },
  { code: 'URU', name: 'Uruguay', flag: '🇺🇾', continent: 'South America' },
  { code: 'FRA', name: 'France', flag: '🇫🇷', continent: 'Europe' },
  { code: 'SEN', name: 'Senegal', flag: '🇸🇳', continent: 'Africa' },
  { code: 'IRQ', name: 'Iraq', flag: '🇮🇶', continent: 'Asia' },
  { code: 'NOR', name: 'Norway', flag: '🇳🇴', continent: 'Europe' },
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', continent: 'South America' },
  { code: 'ALG', name: 'Algeria', flag: '🇩🇿', continent: 'Africa' },
  { code: 'AUT', name: 'Austria', flag: '🇦🇹', continent: 'Europe' },
  { code: 'JOR', name: 'Jordan', flag: '🇯🇴', continent: 'Asia' },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹', continent: 'Europe' },
  { code: 'COD', name: 'DR Congo', flag: '🇨🇩', continent: 'Africa' },
  { code: 'UZB', name: 'Uzbekistan', flag: '🇺🇿', continent: 'Asia' },
  { code: 'COL', name: 'Colombia', flag: '🇨🇴', continent: 'South America' },
  { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', continent: 'Europe' },
  { code: 'CRO', name: 'Croatia', flag: '🇭🇷', continent: 'Europe' },
  { code: 'GHA', name: 'Ghana', flag: '🇬🇭', continent: 'Africa' },
  { code: 'PAN', name: 'Panama', flag: '🇵🇦', continent: 'North America' },
]

export default function TerritoryHubContent() {
  const { t } = useI18n()
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [activeContinent, setActiveContinent] = useState<string>('All')
  const [territories, setTerritories] = useState<Record<string, TerritoryInfo>>({})
  const [userTerritory, setUserTerritory] = useState<UserTerritory | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [territoryRes, userRes] = await Promise.all([
        fetch('/api/territory'),
        isLoggedIn ? fetch('/api/territory/user') : Promise.resolve(null),
      ])

      const territoryData = await territoryRes.json()
      if (territoryData.success) {
        const map: Record<string, TerritoryInfo> = {}
        territoryData.territories.forEach((t: TerritoryInfo) => {
          map[t.teamCode] = t
        })
        setTerritories(map)
      }

      if (userRes) {
        const userData = await userRes.json()
        if (userData.success && userData.territory) {
          setUserTerritory(userData.territory)
        } else {
          setUserTerritory(null)
        }
      }
    } catch (e) {
      console.error('Failed to fetch territories:', e)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleClaim = async (teamCode: string) => {
    if (!isLoggedIn) { setShowLogin(true); return }
    setActionLoading(teamCode)
    try {
      const res = await fetch('/api/territory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode }),
      })
      const data = await res.json()
      if (data.success) {
        toast(t('territory.claimed'))
        fetchData()
      } else {
        toast(data.message || t('territory.alreadyOwned'))
      }
    } catch { toast('Error') }
    finally { setActionLoading(null) }
  }

  const handleJoin = async (teamCode: string) => {
    if (!isLoggedIn) { setShowLogin(true); return }
    setActionLoading(teamCode)
    try {
      const res = await fetch('/api/territory/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode }),
      })
      const data = await res.json()
      if (data.success) {
        toast(t('territory.joined'))
        fetchData()
      } else {
        toast(data.message || t('territory.alreadyMember'))
      }
    } catch { toast('Error') }
    finally { setActionLoading(null) }
  }

  const handleLeave = async (teamCode: string) => {
    setActionLoading(teamCode)
    try {
      const res = await fetch(`/api/territory/membership?teamCode=${teamCode}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast(t('territory.left'))
        fetchData()
      } else {
        toast(data.message || 'Error')
      }
    } catch { toast('Error') }
    finally { setActionLoading(null) }
  }

  const handleUnclaim = async (teamCode: string) => {
    setActionLoading(teamCode)
    try {
      const res = await fetch(`/api/territory?teamCode=${teamCode}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast(t('territory.unclaimedSuccess'))
        fetchData()
      } else {
        toast(data.message || 'Error')
      }
    } catch { toast('Error') }
    finally { setActionLoading(null) }
  }

  const filteredTeams = activeContinent === 'All'
    ? ALL_TEAMS
    : ALL_TEAMS.filter((team) => team.continent === activeContinent)

  const getAction = (team: Team) => {
    const info = territories[team.code]
    const userTc = userTerritory?.teamCode
    const isOwner = userTc === team.code && userTerritory?.role === 'owner'
    const isMember = userTc === team.code && userTerritory?.role === 'member'
    const isClaimed = info?.claimedBy
    const isClaimedByOther = isClaimed && !isOwner && info?.claimedBy?.id

    if (isOwner) return { label: t('territory.unclaim'), type: 'unclaim' as const }
    if (isMember) return { label: t('territory.leave'), type: 'leave' as const }
    if (userTerritory) return null
    if (!isClaimed) return { label: t('territory.claim'), type: 'claim' as const }
    return { label: t('territory.join'), type: 'join' as const }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t('territory.hubTitle')}
        </h1>
        <p className="text-slate-400 mt-2">{t('territory.hubDesc')}</p>
      </div>

      {/* Continent Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CONTINENTS.map((c) => (
          <button
            key={c}
            onClick={() => setActiveContinent(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeContinent === c
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/60 hover:border-slate-600'
            }`}
          >
            {c === 'All' ? t('teamsHub.all') : t(`teamsHub.${c === 'South America' ? 'southAmerica' : c === 'North America' ? 'northAmerica' : c.toLowerCase()}`) || c}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-2">🔍</p>
          <p>{t('territory.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredTeams.map((team) => {
            const info = territories[team.code]
            const action = getAction(team)
            const isLoading = actionLoading === team.code

            return (
              <Link
                key={team.code}
                href={`/football/territories/${team.code}`}
                className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-4 shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Team Flag & Name */}
                <div className="text-center mb-3">
                  <span className="text-4xl block mb-2">{team.flag}</span>
                  <h3 className="text-white font-semibold text-sm truncate">{team.name}</h3>
                  <span className="text-slate-500 text-xs">{team.code}</span>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  {info?.claimedBy ? (
                    <div className="text-center">
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {userTerritory?.teamCode === team.code && userTerritory.role === 'owner'
                          ? t('territory.youOwn')
                          : userTerritory?.teamCode === team.code && userTerritory.role === 'member'
                          ? t('territory.youAreMember')
                          : t('territory.claimedBy', { name: info.claimedBy.displayName || info.claimedBy.name })}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                        {t('territory.unclaimed')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Count */}
                <div className="text-center mb-3">
                  <span className="text-xs text-slate-400">
                    {info?.memberCount
                      ? t('territory.members', { count: String(info.memberCount) })
                      : t('territory.member')}
                  </span>
                </div>

                {/* Action Button */}
                {action && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (action.type === 'unclaim') handleUnclaim(team.code)
                      else if (action.type === 'leave') handleLeave(team.code)
                      else if (action.type === 'claim') handleClaim(team.code)
                      else if (action.type === 'join') handleJoin(team.code)
                    }}
                    disabled={isLoading}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      action.type === 'claim'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : action.type === 'join'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30'
                        : 'bg-slate-700/40 text-slate-400 border border-slate-600/60 hover:bg-slate-600/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      action.label
                    )}
                  </button>
                )}

                {/* Already owns/joined another territory - disabled state */}
                {!action && !info?.claimedBy && (
                  <div className="text-center">
                    <span className="text-xs text-slate-600">{t('territory.alreadyOwned')}</span>
                  </div>
                )}
                {!action && info?.claimedBy && !userTerritory && (
                  <div className="text-center">
                    <span className="text-xs text-slate-600">{t('territory.alreadyMember')}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
