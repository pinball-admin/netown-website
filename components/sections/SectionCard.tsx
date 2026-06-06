'use client'

import Link from 'next/link'

interface SectionCardData {
  id: string
  name: string
  description: string | null
  slug: string
  icon: string | null
  category: string | null
  memberCount: number
  postCount: number
  owner: {
    id: string
    name: string
    displayName: string | null
  } | null
}

interface SectionCardProps {
  section: SectionCardData
}

const CATEGORY_LABELS: Record<string, string> = {
  football: '⚽ 足球',
  electronics: '💻 电子',
  antiques: '🏺 古玩',
  general: '📌 综合',
}

export default function SectionCard({ section }: SectionCardProps) {
  return (
    <Link
      href={`/sections/${section.slug}`}
      className="group block p-5 bg-[#0f1729] border border-slate-800 rounded-xl hover:border-emerald-500/30 hover:bg-[#121b2e] transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-800 rounded-lg">
          {section.icon || '📁'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-base truncate group-hover:text-emerald-400 transition-colors">
              {section.name}
            </h3>
            {section.category && (
              <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                {CATEGORY_LABELS[section.category] || section.category}
              </span>
            )}
          </div>
          {section.description && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-3">
              {section.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span>{section.memberCount} 成员</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📝</span>
              <span>{section.postCount} 帖子</span>
            </span>
            {section.owner && (
              <span className="flex items-center gap-1">
                <span>👑</span>
                <span>{section.owner.displayName || section.owner.name}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-slate-600 group-hover:text-emerald-400 transition-colors">
          →
        </div>
      </div>
    </Link>
  )
}
