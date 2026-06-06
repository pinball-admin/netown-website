'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'

interface TerritoryInfo {
  teamCode: string
  memberCount: number
}

const TEAM_FLAGS: Record<string, string> = {
  MEX: '🇲🇽', KOR: '🇰🇷', CZE: '🇨🇿', RSA: '🇿🇦', CAN: '🇨🇦', BIH: '🇧🇦',
  QAT: '🇶🇦', SUI: '🇨🇭', BRA: '🇧🇷', MAR: '🇲🇦', HAI: '🇭🇹', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸', PAR: '🇵🇾', AUS: '🇦🇺', TUR: '🇹🇷', GER: '🇩🇪', CUW: '🇨🇼',
  ECU: '🇪🇨', CIV: '🇨🇮', NED: '🇳🇱', JPN: '🇯🇵', SWE: '🇸🇪', TUN: '🇹🇳',
  BEL: '🇧🇪', EGY: '🇪🇬', IRN: '🇮🇷', NZL: '🇳🇿', ESP: '🇪🇸', CPV: '🇨🇻',
  KSA: '🇸🇦', URU: '🇺🇾', FRA: '🇫🇷', SEN: '🇸🇳', IRQ: '🇮🇶', NOR: '🇳🇴',
  ARG: '🇦🇷', ALG: '🇩🇿', AUT: '🇦🇹', JOR: '🇯🇴', POR: '🇵🇹', COD: '🇨🇩',
  UZB: '🇺🇿', COL: '🇨🇴', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', CRO: '🇭🇷', GHA: '🇬🇭', PAN: '🇵🇦',
}

export default function TerritorySidebarWidget() {
  const { t } = useI18n()
  const { isLoggedIn } = useAuth()
  const [popular, setPopular] = useState<TerritoryInfo[]>([])
  const [userTc, setUserTc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWidget = async () => {
      try {
        const [popRes, userRes] = await Promise.all([
          fetch('/api/territory/popular'),
          isLoggedIn ? fetch('/api/territory/user') : Promise.resolve(null),
        ])

        const popData = await popRes.json()
        if (popData.success) setPopular(popData.territories)

        if (userRes) {
          const userData = await userRes.json()
          if (userData.success && userData.territory) {
            setUserTc(userData.territory.teamCode)
          }
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchWidget()
  }, [isLoggedIn])

  if (loading) return null
  if (popular.length === 0) return null

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        🏴 {t('territory.popularTerritories')}
      </h2>
      <div className="space-y-2">
        {userTc && (
          <Link
            href={`/football/territories/${userTc}`}
            className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-all"
          >
            <span className="text-2xl">{TEAM_FLAGS[userTc] || '🏳️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 text-sm font-medium truncate">{t('territory.myTerritory')}</p>
              <p className="text-slate-400 text-xs">{userTc}</p>
            </div>
          </Link>
        )}
        {popular.map((t) => (
          <Link
            key={t.teamCode}
            href={`/football/territories/${t.teamCode}`}
            className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 hover:border-emerald-500/30 transition-all"
          >
            <span className="text-2xl">{TEAM_FLAGS[t.teamCode] || '🏳️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-sm font-medium truncate">{t.teamCode}</p>
              <p className="text-slate-500 text-xs">{t.memberCount} members</p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/football/territories"
        className="block mt-3 text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        {t('territory.viewAll')} →
      </Link>
    </div>
  )
}
