'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import LoginModal from '@/components/LoginModal'

// Simplified team list from World Cup 2026
const ALL_TEAMS = [
  { id: 'MEX', name: 'Mexico', flag: '🇲🇽' }, { id: 'KOR', name: 'South Korea', flag: '🇰🇷' },
  { id: 'CZE', name: 'Czech Republic', flag: '🇨🇿' }, { id: 'RSA', name: 'South Africa', flag: '🇿🇦' },
  { id: 'CAN', name: 'Canada', flag: '🇨🇦' }, { id: 'BIH', name: 'Bosnia', flag: '🇧🇦' },
  { id: 'QAT', name: 'Qatar', flag: '🇶🇦' }, { id: 'SUI', name: 'Switzerland', flag: '🇨🇭' },
  { id: 'BRA', name: 'Brazil', flag: '🇧🇷' }, { id: 'MAR', name: 'Morocco', flag: '🇲🇦' },
  { id: 'HAI', name: 'Haiti', flag: '🇭🇹' }, { id: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'USA', name: 'United States', flag: '🇺🇸' }, { id: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
  { id: 'AUS', name: 'Australia', flag: '🇦🇺' }, { id: 'NOR', name: 'Norway', flag: '🇳🇴' },
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷' }, { id: 'IRN', name: 'Iran', flag: '🇮🇷' },
  { id: 'NGA', name: 'Nigeria', flag: '🇳🇬' }, { id: 'UKR', name: 'Ukraine', flag: '🇺🇦' },
  { id: 'COL', name: 'Colombia', flag: '🇨🇴' }, { id: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { id: 'TUN', name: 'Tunisia', flag: '🇹🇳' }, { id: 'BEL', name: 'Belgium', flag: '🇧🇪' },
  { id: 'FRA', name: 'France', flag: '🇫🇷' }, { id: 'EGY', name: 'Egypt', flag: '🇪🇬' },
  { id: 'CRO', name: 'Croatia', flag: '🇭🇷' }, { id: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  { id: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁤󠁿' }, { id: 'SEN', name: 'Senegal', flag: '🇸🇳' },
  { id: 'NED', name: 'Netherlands', flag: '🇳🇱' }, { id: 'WAL', name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { id: 'POR', name: 'Portugal', flag: '🇵🇹' }, { id: 'CIV', name: 'Ivory Coast', flag: '🇨🇮' },
  { id: 'ESP', name: 'Spain', flag: '🇪🇸' }, { id: 'URU', name: 'Uruguay', flag: '🇺🇾' },
  { id: 'GER', name: 'Germany', flag: '🇩🇪' }, { id: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { id: 'ITA', name: 'Italy', flag: '🇮🇹' }, { id: 'DEN', name: 'Denmark', flag: '🇩🇰' },
  { id: 'SRB', name: 'Serbia', flag: '🇷🇸' }, { id: 'POL', name: 'Poland', flag: '🇵🇱' },
  { id: 'CPV', name: 'Cape Verde', flag: '🇨🇻' }, { id: 'GHA', name: 'Ghana', flag: '🇬🇭' },
  { id: 'ALG', name: 'Algeria', flag: '🇩🇿' }, { id: 'CMR', name: 'Cameroon', flag: '🇨🇲' },
  { id: 'SWE', name: 'Sweden', flag: '🇸🇪' }, { id: 'MLI', name: 'Mali', flag: '🇲🇱' },
  { id: 'BFA', name: 'Burkina Faso', flag: '🇧🇫' },
]

const BRACKET_ROUNDS = [
  { round: 'round_of_32', label: 'Round of 32', multiplier: 1, count: 16, emoji: '🌊' },
  { round: 'round_of_16', label: 'Round of 16', multiplier: 2, count: 8, emoji: '🔥' },
  { round: 'quarter_final', label: 'Quarter-finals', multiplier: 3, count: 4, emoji: '⚡' },
  { round: 'semi_final', label: 'Semi-finals', multiplier: 4, count: 2, emoji: '💫' },
  { round: 'final', label: 'Final', multiplier: 6, count: 1, emoji: '🏆' },
]

interface PickData {
  matchSlot: string
  round: string
  pickedTeamId: string
  pickedTeamName: string
  isCorrect?: boolean | null
  pointsEarned?: number
}

const teamMap = new Map(ALL_TEAMS.map(t => [t.id, t]))

function getTeam(id: string) { return teamMap.get(id) }

function getSlotLabel(slot: string): string {
  const parts = slot.split('-')
  const num = parts[1]
  const prefix = parts[0]
  const roundLabels: Record<string, string> = { r32: 'R32', r16: 'R16', qf: 'QF', sf: 'SF' }
  return `${roundLabels[prefix] || prefix} #${num}`
}

function isSlotLocked(slot: string): boolean {
  // Use lock dates from timeline
  const lockDates: Record<string, string> = {
    // R32: June 26 - July 3
    'r32-1': '2026-06-26', 'r32-2': '2026-06-26', 'r32-3': '2026-06-27',
    'r32-4': '2026-06-27', 'r32-5': '2026-06-28', 'r32-6': '2026-06-28',
    'r32-7': '2026-06-29', 'r32-8': '2026-06-29', 'r32-9': '2026-06-30',
    'r32-10': '2026-06-30', 'r32-11': '2026-07-01', 'r32-12': '2026-07-01',
    'r32-13': '2026-07-02', 'r32-14': '2026-07-02', 'r32-15': '2026-07-03',
    'r32-16': '2026-07-03',
    // R16: July 5-8
    'r16-1': '2026-07-05', 'r16-2': '2026-07-05', 'r16-3': '2026-07-06',
    'r16-4': '2026-07-06', 'r16-5': '2026-07-07', 'r16-6': '2026-07-07',
    'r16-7': '2026-07-08', 'r16-8': '2026-07-08',
    // QF: July 10-11
    'qf-1': '2026-07-10', 'qf-2': '2026-07-10', 'qf-3': '2026-07-11', 'qf-4': '2026-07-11',
    // SF: July 14-15
    'sf-1': '2026-07-14', 'sf-2': '2026-07-15',
    // Final: July 19
    'final': '2026-07-19',
  }
  const lockDate = lockDates[slot]
  if (!lockDate) return false
  return new Date(lockDate) <= new Date()
}

function getSlotsForRound(round: string): string[] {
  const prefixes: Record<string, { prefix: string; count: number }> = {
    round_of_32: { prefix: 'r32', count: 16 },
    round_of_16: { prefix: 'r16', count: 8 },
    quarter_final: { prefix: 'qf', count: 4 },
    semi_final: { prefix: 'sf', count: 2 },
    final: { prefix: 'final', count: 1 },
  }
  const info = prefixes[round]
  if (!info) return []
  if (info.prefix === 'final') return ['final']
  return Array.from({ length: info.count }, (_, i) => `${info.prefix}-${i + 1}`)
}

export default function BracketChallenge() {
  const { t } = useI18n()
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [picks, setPicks] = useState<Record<string, PickData>>({})
  const [existingBracket, setExistingBracket] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [showLogin, setShowLogin] = useState(false)
  const [activeRound, setActiveRound] = useState('round_of_32')
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    loadData()
  }, [isLoggedIn])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load bracket if logged in
      if (isLoggedIn) {
        const res = await fetch('/api/bracket/mine')
        const json = await res.json()
        if (json.success && json.bracket) {
          setExistingBracket(json.bracket)
          const pickMap: Record<string, PickData> = {}
          json.bracket.picks.forEach((p: PickData) => {
            pickMap[p.matchSlot] = p
          })
          setPicks(pickMap)
        }
      }

      // Load leaderboard
      const lbRes = await fetch('/api/bracket/leaderboard?limit=10')
      const lbJson = await lbRes.json()
      if (lbJson.success) {
        setLeaderboard(lbJson.leaderboard)
      }
    } catch {}
    setLoading(false)
  }

  const handlePick = (slot: string, round: string, teamId: string) => {
    if (isSlotLocked(slot)) return
    const team = getTeam(teamId)
    setPicks(prev => ({
      ...prev,
      [slot]: {
        matchSlot: slot,
        round,
        pickedTeamId: teamId,
        pickedTeamName: team?.name || teamId,
      },
    }))
  }

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowLogin(true)
      return
    }
    setSaving(true)
    try {
      const picksArray = Object.values(picks)
      const res = await fetch('/api/bracket/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks: picksArray }),
      })
      const json = await res.json()
      if (json.success) {
        toast('Bracket submitted! 🏆', 'success')
        loadData()
      } else {
        toast(json.message || 'Failed to save bracket', 'error')
      }
    } catch {
      toast('Network error', 'error')
    }
    setSaving(false)
  }

  const pickCount = Object.keys(picks).length
  const totalSlots = 31 // 16 + 8 + 4 + 2 + 1
  const isComplete = pickCount >= totalSlots
  const hasChanges = JSON.stringify(picks) !== JSON.stringify(
    existingBracket?.picks?.reduce((m: any, p: PickData) => ({ ...m, [p.matchSlot]: p }), {}) || {}
  )

  const renderRoundSection = (roundInfo: typeof BRACKET_ROUNDS[0]) => {
    const slots = getSlotsForRound(roundInfo.round)
    const locked = slots.filter(s => isSlotLocked(s)).length
    const picked = slots.filter(s => picks[s]?.pickedTeamId).length

    return (
      <div
        key={roundInfo.round}
        className={`bg-slate-800/40 rounded-xl border transition-all cursor-pointer ${
          activeRound === roundInfo.round
            ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
            : 'border-slate-700/60 hover:border-slate-600'
        }`}
      >
        <button
          onClick={() => setActiveRound(roundInfo.round === activeRound ? '' : roundInfo.round)}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{roundInfo.emoji}</span>
            <div className="text-left">
              <div className="text-white font-semibold">{roundInfo.label}</div>
              <div className="text-xs text-slate-500">
                {roundInfo.multiplier}x points · {locked} locked
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${picked === slots.length ? 'text-emerald-400' : 'text-slate-400'}`}>
              {picked}/{slots.length}
            </span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${activeRound === roundInfo.round ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {activeRound === roundInfo.round && (
          <div className="px-4 pb-4 space-y-2 border-t border-slate-700/50 pt-3">
            {slots.map(slot => {
              const pick = picks[slot]
              const team = pick?.pickedTeamId ? getTeam(pick.pickedTeamId) : null
              const locked = isSlotLocked(slot)
              const isCorrect = pick?.isCorrect
              const points = pick?.pointsEarned || 0

              return (
                <div key={slot} className={`flex items-center gap-2 p-2 rounded-lg ${
                  isCorrect === true ? 'bg-emerald-500/10' :
                  isCorrect === false ? 'bg-red-500/5' :
                  'bg-slate-800/60'
                }`}>
                  <span className="text-xs text-slate-400 w-16 flex-shrink-0">{getSlotLabel(slot)}</span>

                  {locked ? (
                    <div className="flex-1 flex items-center gap-2">
                      {team ? (
                        <>
                          <span className="text-lg">{team.flag}</span>
                          <span className={`text-sm font-medium ${
                            isCorrect === true ? 'text-emerald-400' :
                            isCorrect === false ? 'text-red-400' :
                            'text-white'
                          }`}>{team.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">—</span>
                      )}
                      {isCorrect !== null && isCorrect !== undefined && (
                        <span className={`text-xs font-medium ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isCorrect ? `+${points}` : '✗'}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">🔒</span>
                    </div>
                  ) : (
                    <select
                      value={pick?.pickedTeamId || ''}
                      onChange={e => handlePick(slot, roundInfo.round, e.target.value)}
                      className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select team...</option>
                      {ALL_TEAMS.map(t => (
                        <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-48" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🏆 Bracket Challenge
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Predict the knockout stage! Entry: 100 🍬
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1.5 bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500">Picks</div>
              <div className={`text-lg font-bold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                {pickCount}/{totalSlots}
              </div>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="px-3 py-2 text-sm bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {showLeaderboard ? '📋 My Bracket' : '🏆 Leaderboard'}
            </button>
          </div>
        </div>

        {/* Scatter points info */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
          {BRACKET_ROUNDS.map(r => (
            <span key={r.round} className="flex items-center gap-1">
              {r.emoji} {r.label}: {r.multiplier}x
            </span>
          ))}
        </div>
      </div>

      {showLeaderboard ? (
        /* Leaderboard */
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">🏆 Bracket Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No brackets submitted yet. Be the first!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-lg ${
                  i < 3 ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-800/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/30 text-amber-400' :
                      i === 1 ? 'bg-slate-400/30 text-slate-300' :
                      i === 2 ? 'bg-orange-600/30 text-orange-400' :
                      'bg-slate-700/50 text-slate-500'
                    }`}>{entry.ranking}</div>
                    <span className="text-white font-medium text-sm">{entry.name}</span>
                    {entry.role === 'master' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Master</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-sm">{entry.totalScore} pts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Bracket Picks */}
          <div className="space-y-3">
            {BRACKET_ROUNDS.map(renderRoundSection)}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-slate-500">
              {isComplete ? '✅ All picks made!' : `⚠️ ${totalSlots - pickCount} slots remaining`}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!hasChanges || saving || !isComplete}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                hasChanges && isComplete && !saving
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : existingBracket ? 'Update Bracket' : 'Submit Bracket (100 🍬)'}
            </button>
          </div>
        </>
      )}

      {existingBracket && existingBracket.totalScore > 0 && (
        <div className="mt-4 bg-slate-900/40 border border-slate-700/60 rounded-xl p-4 text-center">
          <div className="text-slate-400 text-sm">Total Score</div>
          <div className="text-3xl font-bold text-emerald-400">{existingBracket.totalScore} pts</div>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
