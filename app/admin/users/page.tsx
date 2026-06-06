'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserRow {
  id: string
  email: string
  name: string
  displayName: string | null
  role: string
  region: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  isVerified: boolean
  createdAt: string
  lastLoginAt: string
  preferredLanguage: string
}

const roleBadge: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  master: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  user: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const roleLabel: Record<string, string> = {
  admin: '管理员',
  master: '专家',
  user: '用户',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const pageSize = 20

  const fetchUsers = async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page, search, roleFilter])

  const totalPages = Math.ceil(total / pageSize)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">用户管理</h1>
        <p className="text-slate-400 mt-1">共 {total} 位注册用户</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索用户名称或邮箱..."
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded-lg text-sm font-medium hover:bg-[#00FF66]/20 transition-colors"
          >
            搜索
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF66]/50"
        >
          <option value="">全部角色</option>
          <option value="user">普通用户</option>
          <option value="master">专家</option>
          <option value="admin">管理员</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">用户</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">邮箱</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">角色</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">预测</th>
                <th className="text-center px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">准确率</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">注册时间</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    暂无用户
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm text-slate-300">
                          {(u.displayName || u.name)[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-white font-medium truncate max-w-[120px] sm:max-w-[200px]">
                            {u.displayName || u.name}
                          </div>
                          <div className="text-slate-500 text-xs">{u.region}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full border ${roleBadge[u.role] || roleBadge.user}`}
                      >
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300 hidden sm:table-cell">
                      {u.totalPredictions}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {u.totalPredictions > 0 ? (
                        <span
                          className={
                            u.correctPredictions / u.totalPredictions >= 0.6
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }
                        >
                          {Math.round((u.correctPredictions / u.totalPredictions) * 100)}%
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('zh-CN')}
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
