'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PostRow {
  id: string
  content: string
  sourceLanguage: string
  likes: number
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  _count: { comments: number; reactions: number }
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const pageSize = 20

  const fetchPosts = async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/posts?${params}`)
      const data = await res.json()
      if (data.success) {
        setPosts(data.posts)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(page)
  }, [page, search])

  const totalPages = Math.ceil(total / pageSize)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('确定删除此帖子？评论和反应也将被删除。')) return
    setDeleting(postId)
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      const data = await res.json()
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        setTotal((prev) => prev - 1)
      }
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">帖子管理</h1>
        <p className="text-slate-400 mt-1">共 {total} 条帖子</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="搜索帖子内容..."
          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded-lg text-sm font-medium hover:bg-[#00FF66]/20 transition-colors"
        >
          搜索
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="inline-block animate-spin w-5 h-5 border-2 border-[#00FF66] border-t-transparent rounded-full mr-2" />
            加载中...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">暂无帖子</div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm line-clamp-3 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <Link
                      href={`/admin/users/${post.user.id}`}
                      className="text-[#00FF66] hover:underline"
                    >
                      {post.user.name || post.user.email}
                    </Link>
                    <span>💬 {post._count.comments}</span>
                    <span>🔥 {post._count.reactions}</span>
                    <span>❤️ {post.likes}</span>
                    <span>🌐 {post.sourceLanguage}</span>
                    <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                >
                  {deleting === post.id ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-white"
          >
            上一页
          </button>
          <span className="text-sm text-slate-400 px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-slate-400 disabled:opacity-40 hover:text-white"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
