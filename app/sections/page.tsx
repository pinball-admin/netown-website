'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionCard from '@/components/sections/SectionCard'

const CATEGORIES = [
  { value: '', label: '全部' },
  { value: 'football', label: '⚽ 足球' },
  { value: 'electronics', label: '💻 电子' },
  { value: 'antiques', label: '🏺 古玩' },
  { value: 'general', label: '📌 综合' },
]

interface SectionData {
  id: string
  name: string
  description: string | null
  slug: string
  icon: string | null
  category: string | null
  memberCount: number
  postCount: number
  owner: { id: string; name: string; displayName: string | null } | null
}

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchSections = async (cat: string, q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cat) params.set('category', cat)
      if (q) params.set('search', q)
      const res = await fetch(`/api/sections?${params}`)
      const data = await res.json()
      if (data.success) setSections(data.sections)
    } catch (err) {
      console.error('Failed to fetch sections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections(category, search)
  }, [category, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">Netown</Link>
          <div className="flex items-center gap-3">
            <Link
              href="/sections/create"
              className="px-4 py-2 bg-emerald-500 text-black font-bold text-sm rounded-lg hover:bg-emerald-400 transition-all"
            >
              + 创建板块
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📋 板块大厅</h1>
          <p className="text-slate-400">浏览所有板块，找到你感兴趣的社区加入</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索板块..."
              className="w-full px-4 py-2.5 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          </div>
        </form>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-all ${
                category === cat.value
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sections grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">暂无板块</h3>
            <p className="text-slate-400 mb-6">
              {search ? '没有找到匹配的板块' : '还没有人创建板块，快来做第一个！'}
            </p>
            {!search && (
              <Link
                href="/sections/create"
                className="inline-block px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                创建板块
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
