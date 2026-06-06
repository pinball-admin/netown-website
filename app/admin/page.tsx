'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalUsers: number
  totalPredictions: number
  settledPredictions: number
  correctPredictions: number
  totalPosts: number
  totalTransactions: number
  activeUsers24h: number
  adminUsers: number
  masterUsers: number
  accuracy: number
}

const cards = [
  { label: '总用户数', key: 'totalUsers' as const, color: 'from-blue-500 to-cyan-500', suffix: '' },
  { label: '预测总数', key: 'totalPredictions' as const, color: 'from-purple-500 to-pink-500', suffix: '' },
  { label: '已结算', key: 'settledPredictions' as const, color: 'from-emerald-500 to-teal-500', suffix: '' },
  { label: '预测准确率', key: 'accuracy' as const, color: 'from-orange-500 to-red-500', suffix: '%' },
  { label: '帖子总数', key: 'totalPosts' as const, color: 'from-amber-500 to-yellow-500', suffix: '' },
  { label: '糖果交易', key: 'totalTransactions' as const, color: 'from-indigo-500 to-violet-500', suffix: '' },
  { label: '24h 活跃', key: 'activeUsers24h' as const, color: 'from-green-500 to-emerald-500', suffix: '' },
  { label: '管理员/专家', key: 'adminMaster' as const, color: 'from-rose-500 to-pink-500', suffix: '' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats)
        else setError(data.message || 'Failed to load stats')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#00FF66] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">控制台</h1>
        <p className="text-slate-400 mt-1">Netown 平台数据总览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          let value: string
          if (card.key === 'adminMaster') {
            value = `${stats?.adminUsers ?? '-'}/${stats?.masterUsers ?? '-'}`
          } else if (card.key === 'accuracy') {
            value = `${stats?.accuracy ?? '-'}`
          } else {
            value = stats?.[card.key]?.toLocaleString() ?? '-'
          }

          return (
            <div
              key={card.key}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/80 transition-all"
            >
              <div className="text-sm text-slate-400 mb-2">{card.label}</div>
              <div
                className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
              >
                {value}
                {card.suffix}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-500/30 transition-all group"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
              用户管理
            </div>
            <div className="text-sm text-slate-500 mt-1">查看和管理所有注册用户</div>
          </a>
          <a
            href="/admin/matches"
            className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-500/30 transition-all group"
          >
            <div className="text-2xl mb-2">⚽</div>
            <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
              比赛管理
            </div>
            <div className="text-sm text-slate-500 mt-1">录入比分、结算预测</div>
          </a>
          <a
            href="/admin/posts"
            className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-500/30 transition-all group"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
              帖子管理
            </div>
            <div className="text-sm text-slate-500 mt-1">审核和管理社区帖子</div>
          </a>
        </div>
      </div>
    </div>
  )
}
