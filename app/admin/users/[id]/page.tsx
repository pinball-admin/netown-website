'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserDetail {
  id: string
  email: string
  name: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  role: string
  region: string
  preferredLanguage: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  currentStreak: number
  longestStreak: number
  lastLoginDate: string | null
  lastLoginAt: string
  isVerified: boolean
  predictionUnlockUntil: string | null
  referralCode: string | null
  createdAt: string
  _count: {
    predictions: number
    posts: number
    comments: number
    candyTransactions: number
  }
}

const roleOptions = [
  { value: 'user', label: '普通用户' },
  { value: 'master', label: '专家' },
  { value: 'admin', label: '管理员' },
]

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editCandy, setEditCandy] = useState('')

  const userId = params.id as string

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user)
          setEditRole(data.user.role)
          setEditCandy(String(data.user.candyBalance))
        } else {
          setMessage(data.message || 'Failed to load user')
        }
      })
      .catch(() => setMessage('Network error'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleSave = async () => {
    setUpdating(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          candyBalance: parseInt(editCandy) || 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setUser((prev) =>
          prev ? { ...prev, role: data.user.role, candyBalance: data.user.candyBalance } : prev
        )
        setMessage('✅ 保存成功')
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch {
      setMessage('❌ 保存失败')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#00FF66] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
          {message || '用户不存在'}
        </div>
        <Link
          href="/admin/users"
          className="inline-block mt-4 text-sm text-[#00FF66] hover:underline"
        >
          ← 返回用户列表
        </Link>
      </div>
    )
  }

  const accuracy =
    user.totalPredictions > 0
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
      : 0

  return (
    <div className="p-6">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        ← 返回用户列表
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl text-slate-300">
          {(user.displayName || user.name)[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.displayName || user.name}</h1>
          <p className="text-slate-400">{user.email}</p>
        </div>
        <span
          className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border ${
            user.role === 'admin'
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : user.role === 'master'
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
          }`}
        >
          {roleOptions.find((r) => r.value === user.role)?.label || user.role}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Info + Edit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">编辑用户</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">角色</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF66]/50"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Candy 余额</label>
                <input
                  type="number"
                  value={editCandy}
                  onChange={(e) => setEditCandy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF66]/50"
                />
              </div>
            </div>
            {message && (
              <div
                className={`text-sm mb-3 ${
                  message.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {message}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={updating}
              className="px-5 py-2 bg-[#00FF66] text-black font-semibold rounded-lg text-sm hover:bg-[#00FF66]/90 disabled:opacity-50 transition-all"
            >
              {updating ? '保存中...' : '保存修改'}
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">统计数据</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '预测总数', value: user.totalPredictions },
                { label: '预测正确', value: user.correctPredictions },
                { label: '预测准确率', value: `${accuracy}%` },
                { label: '连续签到', value: `${user.currentStreak} 天` },
                { label: '最长签到', value: `${user.longestStreak} 天` },
                { label: '帖子', value: user._count.posts },
                { label: '评论', value: user._count.comments },
                { label: '糖果交易', value: user._count.candyTransactions },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                  <div className="text-lg font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Basic Info */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">基本信息</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: '用户 ID', value: user.id },
                { label: '邮箱', value: user.email },
                { label: '显示名称', value: user.displayName || '-' },
                { label: '地区', value: user.region },
                { label: '语言偏好', value: user.preferredLanguage },
                { label: '邮箱验证', value: user.isVerified ? '✅ 已验证' : '❌ 未验证' },
                { label: '注册时间', value: new Date(user.createdAt).toLocaleString('zh-CN') },
                { label: '最后登录', value: new Date(user.lastLoginAt).toLocaleString('zh-CN') },
                { label: '邀请码', value: user.referralCode || '-' },
              ].map((info) => (
                <div key={info.label} className="flex justify-between">
                  <span className="text-slate-400">{info.label}</span>
                  <span className="text-slate-200 text-right max-w-[200px] truncate">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
