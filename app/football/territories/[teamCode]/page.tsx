'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'

interface TerritoryDetail {
  teamCode: string
  claimedBy: { id: string; name: string; displayName: string | null; avatarUrl: string | null } | null
  claimedAt: string | null
  memberCount: number
  members: Array<{
    id: string
    userId: string
    name: string
    displayName: string | null
    avatarUrl: string | null
    joinedAt: string
  }>
}

const TEAM_INFO: Record<string, { name: string; flag: string; continent: string }> = {
  MEX: { name: 'Mexico', flag: '🇲🇽', continent: 'North America' },
  KOR: { name: 'South Korea', flag: '🇰🇷', continent: 'Asia' },
  CZE: { name: 'Czech Republic', flag: '🇨🇿', continent: 'Europe' },
  RSA: { name: 'South Africa', flag: '🇿🇦', continent: 'Africa' },
  CAN: { name: 'Canada', flag: '🇨🇦', continent: 'North America' },
  BIH: { name: 'Bosnia', flag: '🇧🇦', continent: 'Europe' },
  QAT: { name: 'Qatar', flag: '🇶🇦', continent: 'Asia' },
  SUI: { name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' },
  BRA: { name: 'Brazil', flag: '🇧🇷', continent: 'South America' },
  MAR: { name: 'Morocco', flag: '🇲🇦', continent: 'Africa' },
  HAI: { name: 'Haiti', flag: '🇭🇹', continent: 'North America' },
  SCO: { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', continent: 'Europe' },
  USA: { name: 'United States', flag: '🇺🇸', continent: 'North America' },
  PAR: { name: 'Paraguay', flag: '🇵🇾', continent: 'South America' },
  AUS: { name: 'Australia', flag: '🇦🇺', continent: 'Asia' },
  TUR: { name: 'Turkey', flag: '🇹🇷', continent: 'Europe' },
  GER: { name: 'Germany', flag: '🇩🇪', continent: 'Europe' },
  CUW: { name: 'Curacao', flag: '🇨🇼', continent: 'North America' },
  ECU: { name: 'Ecuador', flag: '🇪🇨', continent: 'South America' },
  CIV: { name: 'Ivory Coast', flag: '🇨🇮', continent: 'Africa' },
  NED: { name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' },
  JPN: { name: 'Japan', flag: '🇯🇵', continent: 'Asia' },
  SWE: { name: 'Sweden', flag: '🇸🇪', continent: 'Europe' },
  TUN: { name: 'Tunisia', flag: '🇹🇳', continent: 'Africa' },
  BEL: { name: 'Belgium', flag: '🇧🇪', continent: 'Europe' },
  EGY: { name: 'Egypt', flag: '🇪🇬', continent: 'Africa' },
  IRN: { name: 'Iran', flag: '🇮🇷', continent: 'Asia' },
  NZL: { name: 'New Zealand', flag: '🇳🇿', continent: 'Asia' },
  ESP: { name: 'Spain', flag: '🇪🇸', continent: 'Europe' },
  CPV: { name: 'Cape Verde', flag: '🇨🇻', continent: 'Africa' },
  KSA: { name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Asia' },
  URU: { name: 'Uruguay', flag: '🇺🇾', continent: 'South America' },
  FRA: { name: 'France', flag: '🇫🇷', continent: 'Europe' },
  SEN: { name: 'Senegal', flag: '🇸🇳', continent: 'Africa' },
  IRQ: { name: 'Iraq', flag: '🇮🇶', continent: 'Asia' },
  NOR: { name: 'Norway', flag: '🇳🇴', continent: 'Europe' },
  ARG: { name: 'Argentina', flag: '🇦🇷', continent: 'South America' },
  ALG: { name: 'Algeria', flag: '🇩🇿', continent: 'Africa' },
  AUT: { name: 'Austria', flag: '🇦🇹', continent: 'Europe' },
  JOR: { name: 'Jordan', flag: '🇯🇴', continent: 'Asia' },
  POR: { name: 'Portugal', flag: '🇵🇹', continent: 'Europe' },
  COD: { name: 'DR Congo', flag: '🇨🇩', continent: 'Africa' },
  UZB: { name: 'Uzbekistan', flag: '🇺🇿', continent: 'Asia' },
  COL: { name: 'Colombia', flag: '🇨🇴', continent: 'South America' },
  ENG: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', continent: 'Europe' },
  CRO: { name: 'Croatia', flag: '🇭🇷', continent: 'Europe' },
  GHA: { name: 'Ghana', flag: '🇬🇭', continent: 'Africa' },
  PAN: { name: 'Panama', flag: '🇵🇦', continent: 'North America' },
}

export default function TerritoryDetailPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const params = useParams()
  const teamCode = (params?.teamCode as string)?.toUpperCase() || ''

  const [detail, setDetail] = useState<TerritoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamCode) return
    setLoading(true)
    fetch(`/api/territory/${teamCode}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDetail(data.territory)
        else setError(data.message || 'Not found')
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [teamCode])

  const team = TEAM_INFO[teamCode]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">🔍</p>
        <p className="text-slate-400">{error || 'Team not found'}</p>
        <Link
          href="/football/territories"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          ← {t('territory.viewAll')}
        </Link>
      </div>
    )
  }

  const isClaimed = detail?.claimedBy !== null && detail?.claimedBy !== undefined
  const isOwner = isClaimed && user?.id === detail?.claimedBy?.id

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href="/football/territories"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('territory.viewAll')}
      </Link>

      {/* Team Header */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-8 shadow-xl mb-6 text-center">
        <span className="text-7xl block mb-4">{team.flag}</span>
        <h1 className="text-3xl font-bold text-white mb-1">{team.name}</h1>
        <p className="text-slate-400 text-sm mb-4">{teamCode}</p>

        {isClaimed ? (
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-lg text-white font-bold">
              {detail!.claimedBy!.displayName?.charAt(0).toUpperCase() || detail!.claimedBy!.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500">{t('territory.territoryLord')}</p>
              <p className="text-emerald-400 font-semibold">
                {isOwner ? t('territory.youOwn') : (detail!.claimedBy!.displayName || detail!.claimedBy!.name)}
              </p>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-slate-800/40 border border-slate-700/60 rounded-lg px-4 py-2">
            <span className="text-slate-400 text-sm">{t('territory.unclaimed')}</span>
          </div>
        )}

        {detail && (
          <p className="text-slate-400 text-sm mt-4">
            {detail.memberCount > 0
              ? t('territory.members', { count: String(detail.memberCount) })
              : t('territory.member')}
          </p>
        )}
      </div>

      {/* Members List */}
      {detail && detail.members.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            👥 {t('territory.memberList')}
            <span className="text-sm text-slate-500 font-normal">({detail.memberCount})</span>
          </h2>
          <div className="space-y-3">
            {detail.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/60"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm text-white font-bold flex-shrink-0">
                  {member.displayName?.charAt(0).toUpperCase() || member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">
                    {member.displayName || member.name}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {t('territory.joined')} · {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unclaimed State */}
      {!isClaimed && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-8 shadow-xl text-center">
          <p className="text-4xl mb-3">🏳️</p>
          <p className="text-slate-400">{t('territory.cantJoinUnclaimed')}</p>
          <Link
            href="/football/territories"
            className="inline-block mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all"
          >
            {t('territory.claim')} {teamCode} →
          </Link>
        </div>
      )}
    </div>
  )
}
