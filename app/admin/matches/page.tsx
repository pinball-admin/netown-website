'use client'

import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface MatchInfo {
  id: string
  homeTeam: { id: string; name: string; shortName: string; flag: string; group: string }
  awayTeam: { id: string; name: string; shortName: string; flag: string; group: string }
  date: string
  time: string
  group: string
  status: string
  score?: { home: number; away: number }
}

interface SettlementResult {
  success: boolean
  message?: string
  settled?: number
  correct?: number
  winner?: string
  accuracy?: number
  forumPostId?: string
}

type TabType = 'pending' | 'settled'

export default function AdminMatches() {
  const { tTeam } = useI18n()
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})
  const [settling, setSettling] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, SettlementResult>>({})
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [batchSettling, setBatchSettling] = useState(false)
  const [settledMatchIds, setSettledMatchIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/predictions/auto?limit=48')
      const json = await res.json()
      if (json.success && json.predictions) {
        const matchList: MatchInfo[] = json.predictions.map((p: any) => ({
          id: p.match.id,
          homeTeam: p.match.homeTeam,
          awayTeam: p.match.awayTeam,
          date: p.match.date,
          time: p.match.time,
          group: p.match.group,
          status: p.match.status || 'scheduled',
          score: p.match.score,
        }))
        setMatches(matchList)
      }
    } catch (err) {
      console.error('[Admin] Failed to fetch matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSettle = async (matchId: string) => {
    const score = scores[matchId]
    if (!score || !score.home || !score.away) return

    setSettling(matchId)
    try {
      const res = await fetch('/api/matches/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(score.home),
          awayScore: parseInt(score.away),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setResults((prev) => ({ ...prev, [matchId]: json }))
        setSettledMatchIds((prev) => new Set(Array.from(prev).concat([matchId])))
        setScores((prev) => {
          const next = { ...prev }
          delete next[matchId]
          return next
        })
      } else {
        setResults((prev) => ({ ...prev, [matchId]: json }))
      }
    } catch {
      setResults((prev) => ({
        ...prev,
        [matchId]: { success: false, message: 'Network error' },
      }))
    } finally {
      setSettling(null)
    }
  }

  const handleBatchSettle = async () => {
    const readyToSettle = matches.filter(
      (m) => !m.score && !settledMatchIds.has(m.id) && !results[m.id]?.success && scores[m.id]?.home && scores[m.id]?.away
    )

    if (readyToSettle.length === 0) {
      alert('请先输入比分再批量结算。')
      return
    }

    setBatchSettling(true)
    let successCount = 0
    let failCount = 0

    for (const match of readyToSettle) {
      try {
        const res = await fetch('/api/matches/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId: match.id,
            homeScore: parseInt(scores[match.id].home),
            awayScore: parseInt(scores[match.id].away),
          }),
        })
        const json = await res.json()
        if (json.success) {
          setResults((prev) => ({ ...prev, [match.id]: json }))
          setSettledMatchIds((prev) => new Set(Array.from(prev).concat([match.id])))
          setScores((prev) => {
            const next = { ...prev }
            delete next[match.id]
            return next
          })
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
      await new Promise((r) => setTimeout(r, 200))
    }

    setBatchSettling(false)
    alert(`批量结算完成：${successCount} 场成功，${failCount} 场失败`)
  }

  const updateScore = (matchId: string, field: 'home' | 'away', value: string) => {
    if (!/^\d*$/.test(value)) return
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || { home: '', away: '' }), [field]: value },
    }))
  }

  const { pendingMatches, settledMatches } = useMemo(() => {
    const pending: MatchInfo[] = []
    const settled: MatchInfo[] = []
    matches.forEach((m) => {
      if (m.score || settledMatchIds.has(m.id) || results[m.id]?.success) {
        settled.push(m)
      } else {
        pending.push(m)
      }
    })
    return { pendingMatches: pending, settledMatches: settled }
  }, [matches, settledMatchIds, results])

  const displayMatches = activeTab === 'pending' ? pendingMatches : settledMatches
  const readyCount = pendingMatches.filter((m) => scores[m.id]?.home && scores[m.id]?.away).length

  const groupedByGroup: Record<string, MatchInfo[]> = {}
  displayMatches.forEach((m) => {
    if (!groupedByGroup[m.group]) groupedByGroup[m.group] = []
    groupedByGroup[m.group].push(m)
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">比赛管理</h1>
            <p className="text-slate-400 mt-1">录入比分、结算预测</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchMatches}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-sm hover:text-white transition-colors"
            >
              🔄 刷新
            </button>
            {activeTab === 'pending' && readyCount > 0 && (
              <button
                onClick={handleBatchSettle}
                disabled={batchSettling}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 transition-all"
              >
                {batchSettling ? '⏳ 结算中...' : `⚡ 批量结算 (${readyCount})`}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{matches.length}</div>
            <div className="text-xs text-slate-500 mt-1">总比赛数</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{settledMatches.length}</div>
            <div className="text-xs text-slate-500 mt-1">已结算</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{pendingMatches.length}</div>
            <div className="text-xs text-slate-500 mt-1">待结算</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-slate-800/40 text-slate-400 border border-slate-700/60 hover:text-white'
          }`}
        >
          ⏳ 待结算 ({pendingMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('settled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'settled'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800/40 text-slate-400 border border-slate-700/60 hover:text-white'
          }`}
        >
          ✅ 已结算 ({settledMatches.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      ) : displayMatches.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {activeTab === 'pending' ? '🎉 所有比赛已结算！' : '暂无已结算比赛。'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedByGroup).map(([group, groupMatches]) => (
            <div
              key={group}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4"
            >
              <h3 className="text-emerald-400 font-semibold text-sm mb-3">{group}</h3>
              <div className="space-y-2">
                {groupMatches.map((match) => {
                  const result = results[match.id]
                  const isSettled = result?.success || match.score || settledMatchIds.has(match.id)
                  const isSettling = settling === match.id
                  const homeName = tTeam(match.homeTeam.id) || match.homeTeam.shortName
                  const awayName = tTeam(match.awayTeam.id) || match.awayTeam.shortName

                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isSettled
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span>{match.homeTeam.flag}</span>
                          <span className="text-white font-medium">{homeName}</span>
                          <span className="text-slate-500">vs</span>
                          <span className="text-white font-medium">{awayName}</span>
                          <span>{match.awayTeam.flag}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {match.date} {match.time}
                        </span>
                      </div>

                      {isSettled ? (
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold text-lg">
                            {match.score
                              ? `${match.score.home} - ${match.score.away}`
                              : result?.settled !== undefined
                              ? `${scores[match.id]?.home || '?'} - ${scores[match.id]?.away || '?'}`
                              : '已结算 ✓'}
                          </span>
                          {result && result.settled !== undefined && (
                            <span className="text-xs text-slate-400">
                              ({result.settled} 预测, {result.correct} 正确, {result.accuracy}% 准确率)
                            </span>
                          )}
                          {result?.winner && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400">
                              {result.winner === 'home'
                                ? homeName
                                : result.winner === 'away'
                                ? awayName
                                : '平局'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={scores[match.id]?.home || ''}
                            onChange={(e) => updateScore(match.id, 'home', e.target.value)}
                            placeholder="0"
                            maxLength={2}
                            className="w-14 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-center text-white text-sm focus:border-emerald-500 focus:outline-none"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="text"
                            value={scores[match.id]?.away || ''}
                            onChange={(e) => updateScore(match.id, 'away', e.target.value)}
                            placeholder="0"
                            maxLength={2}
                            className="w-14 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-center text-white text-sm focus:border-emerald-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSettle(match.id)}
                            disabled={isSettling || !scores[match.id]?.home || !scores[match.id]?.away}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            {isSettling ? '...' : '结算'}
                          </button>
                        </div>
                      )}

                      {result && !result.success && (
                        <p className="text-red-400 text-xs mt-1">{result.message}</p>
                      )}
                      {result?.forumPostId && (
                        <p className="text-blue-400 text-xs mt-1">📢 论坛帖子已发布</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
