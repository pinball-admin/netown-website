'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PredictionRow {
  id: string
  matchId: string
  userId: string
  predictionType: string
  prediction: string
  difficulty: string
  isCorrect: boolean | null
  pointsAwarded: number
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
}

interface MatchStat {
  matchId: string
  _count: { id: number }
  _sum: { pointsAwarded: number | null }
}

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState<PredictionRow[]>([])
  const [matchStats, setMatchStats] = useState<MatchStat[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [matchIdFilter, setMatchIdFilter] = useState('')
  const pageSize = 20

  const fetchPredictions = async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
      if (matchIdFilter) params.set('matchId', matchIdFilter)
      const res = await fetch(`/api/admin/predictions?${params}`)
      const data = await res.json()
      if (data.success) {
        setPredictions(data.predictions)
        setMatchStats(data.matchStats || [])
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions(page)
  }, [page, matchIdFilter])

  const totalPages = Math.ceil(total / pageSize)

  const difficultyBadge: Record<string, string> = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400',
  }

  const typeLabel: Record<string, string> = {
    MATCH_RESULT: '赛果',
    SCORE: '比分',
    OVER_UNDER: '大小球',
    TOTAL_GOALS: '总进球',
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">预测管理</h1>
        <p className="text-slate-400 mt-1">共 {total} 条预测</p>
      </div>

      {/* Match Stats Overview */}
      {matchStats.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">比赛预测统计</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {matchStats.slice(0, 24).map((stat) => (
              <button
                key={stat.matchId}
                onClick={() => {
                  setMatchIdFilter(matchIdFilter === stat.matchId ? '' : stat.matchId)
                  setPage(1)
                }}
                className={`text-left bg-slate-900/40 border rounded-xl p-3 transition-all hover:border-emerald-500/30 ${
                  matchIdFilter === stat.matchId
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-slate-800/60'
                }`}
              >
                <div className="text-xs text-slate-500 truncate">{stat.matchId}</div>
                <div className="text-lg font-bold text-white mt-1">{stat._count.id}</div>
                <div className="text-xs text-slate-400">
                  {stat._sum.pointsAwarded || 0} pts
                </div>
              </button>
            ))}
          </div>
          {matchIdFilter && (
            <button
              onClick={() => { setMatchIdFilter(''); setPage(1) }}
              className="mt-2 text-xs text-[#00FF66] hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>
      )}

      {/* Predictions Table */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">用户</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">
                  比赛
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">预测</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">难度</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium">结果</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">
                  时间
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin w-5 h-5 border-2 border-[#00FF66] border-t-transparent rounded-full mr-2" />
                    加载中...
                  </td>
                </tr>
              ) : predictions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    暂无预测
                  </td>
                </tr>
              ) : (
                predictions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${p.user.id}`}
                        className="text-[#00FF66] hover:underline"
                      >
                        {p.user.name || p.user.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell font-mono text-xs">
                      {p.matchId}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-200">
                        {typeLabel[p.predictionType] || p.predictionType}
                      </span>
                      <span className="text-slate-500 ml-1">→</span>
                      <span className="text-white ml-1">{p.prediction}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          difficultyBadge[p.difficulty] || 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.isCorrect === null ? (
                        <span className="text-slate-600">-</span>
                      ) : p.isCorrect ? (
                        <span className="text-emerald-400">✅ 正确</span>
                      ) : (
                        <span className="text-red-400">❌ 错误</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs hidden sm:table-cell">
                      {new Date(p.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-white transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-slate-400 px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-white transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
