'use client'

import Link from 'next/link'
import CreateSectionForm from '@/components/sections/CreateSectionForm'

export default function CreateSectionPage() {
  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">Netown</Link>
          <Link
            href="/sections"
            className="text-sm text-slate-400 hover:text-white transition-all"
          >
            ← 返回板块列表
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✨ 创建新板块</h1>
          <p className="text-slate-400">
            创建一个属于你的社区板块，消耗 100 颗糖果，提交后需要管理员审核通过方可上线
          </p>
        </div>

        {/* Form */}
        <CreateSectionForm />
      </div>
    </div>
  )
}
