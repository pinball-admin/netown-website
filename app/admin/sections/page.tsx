'use client'

import { useState, useEffect } from 'react'

interface SectionItem {
  id: string
  name: string
  slug: string
  icon: string | null
  category: string | null
  status: string
  memberCount: number
  postCount: number
  creationCost: number
  rejectReason: string | null
  createdAt: string
  approvedAt: string | null
  owner: { id: string; name: string; displayName: string | null; email: string } | null
  approvedBy: { id: string; name: string; displayName: string | null } | null
}

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
]

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ id: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const pageSize = 20

  const fetchSections = async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize), status })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/sections?${params}`)
      const data = await res.json()
      if (data.success) {
        setSections(data.sections)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections(page)
  }, [page, status, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      const data = await res.json()
      if (data.success) {
        fetchSections(page)
      }
    } catch (err) {
      console.error('Failed to approve:', err)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!rejectDialog) return
    setProcessing(rejectDialog.id)
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rejectDialog.id, action: 'reject', rejectReason: rejectReason || 'Not approved' }),
      })
      const data = await res.json()
      if (data.success) {
        setRejectDialog(null)
        setRejectReason('')
        fetchSections(page)
      }
    } catch (err) {
      console.error('Failed to reject:', err)
    } finally {
      setProcessing(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">📋 板块管理</h1>
        <p className="text-slate-400 text-sm">管理用户创建的板块，审核新板块的上线请求</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1) }}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                status === opt.value
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索板块名称..."
            className="w-full px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20 text-slate-500">暂无板块数据</div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-[#0f1729] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{section.icon || '📁'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{section.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full border ${STATUS_STYLES[section.status] || ''}`}>
                      {section.status === 'pending' ? '待审核' : section.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                    {section.category && (
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{section.category}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>/{section.slug}</span>
                    <span>👥 {section.memberCount}</span>
                    <span>📝 {section.postCount}</span>
                    <span>🍬 {section.creationCost}</span>
                    {section.owner && <span>创建者：{section.owner.displayName || section.owner.name}</span>}
                    {section.rejectReason && <span className="text-red-400">原因：{section.rejectReason}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {section.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(section.id)}
                        disabled={processing === section.id}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                      >
                        {processing === section.id ? '...' : '通过'}
                      </button>
                      <button
                        onClick={() => setRejectDialog({ id: section.id, name: section.name })}
                        disabled={processing === section.id}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all disabled:opacity-50"
                      >
                        拒绝
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition-all"
          >
            ← 上一页
          </button>
          <span className="text-sm text-slate-400">
            {page} / {totalPages} 页（共 {total} 条）
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition-all"
          >
            下一页 →
          </button>
        </div>
      )}

      {/* Reject dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0f1729] border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">拒绝板块</h3>
            <p className="text-slate-400 text-sm mb-4">确定拒绝 <span className="text-white font-bold">{rejectDialog.name}</span>？请填写拒绝原因。</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="填写拒绝原因..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectDialog(null); setRejectReason('') }}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={processing === rejectDialog.id}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-400 disabled:opacity-50 transition-all"
              >
                {processing === rejectDialog.id ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
