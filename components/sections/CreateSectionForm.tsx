'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORIES = [
  { value: 'football', label: '⚽ 足球' },
  { value: 'electronics', label: '💻 电子' },
  { value: 'antiques', label: '🏺 古玩' },
  { value: 'general', label: '📌 综合' },
]

export default function CreateSectionForm() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📁',
    category: '',
    rules: '',
  })

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData(prev => ({ ...prev, name, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Failed to create section')
        return
      }

      await refreshUser()
      router.push(`/sections/${data.section.slug}?created=true`)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">请先登录</h2>
        <p className="text-slate-400">登录后即可创建板块</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Candy Balance */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">当前糖果余额</p>
            <p className="text-2xl font-bold text-emerald-400">{user.candyBalance} 🍬</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">创建消耗</p>
            <p className="text-2xl font-bold text-amber-400">100 🍬</p>
          </div>
        </div>
        {(user.candyBalance ?? 0) < 100 && (
          <p className="mt-2 text-xs text-red-400">糖果不足！创建板块需要 100 颗糖果。</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          板块名称 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="例如：数码产品讨论"
          maxLength={50}
          required
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Slug (auto-generated) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          标识符（URL）
        </label>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm">
          <span>/sections/</span>
          <span className="text-emerald-400 font-mono">{formData.slug || 'your-slug'}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">根据名称自动生成，只能包含小写字母、数字和连字符</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          板块简介
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="介绍一下这个板块是讨论什么的..."
          maxLength={200}
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
        />
        <p className="mt-1 text-xs text-slate-500">{formData.description.length}/200</p>
      </div>

      {/* Icon */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          图标 Emoji
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
          placeholder="📁"
          maxLength={2}
          className="w-20 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-center text-2xl"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          分类
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
        >
          <option value="">选择分类（可选）</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Rules */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          版规
        </label>
        <textarea
          value={formData.rules}
          onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
          placeholder="制定板块规则，如：禁止广告、友善讨论..."
          maxLength={500}
          rows={4}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
        />
        <p className="mt-1 text-xs text-slate-500">{formData.rules.length}/500</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || (user.candyBalance ?? 0) < 100}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? '创建中...' : `消耗 100 🍬 创建板块`}
      </button>

      <p className="text-xs text-slate-500 text-center">
        创建板块消耗 100 颗糖果，提交后需要管理员审核通过方可上线
      </p>
    </form>
  )
}
