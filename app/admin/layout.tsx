'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const sidebarItems = [
  { label: '控制台', href: '/admin', icon: '📊' },
  { label: '用户管理', href: '/admin/users', icon: '👥' },
  { label: '帖子管理', href: '/admin/posts', icon: '📝' },
  { label: '板块管理', href: '/admin/sections', icon: '📋' },
  { label: '预测管理', href: '/admin/predictions', icon: '🎯' },
  { label: '比赛管理', href: '/admin/matches', icon: '⚽' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#00FF66] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">需要管理员权限</h1>
          <p className="text-slate-400 mb-6">
            当前账户没有管理员访问权限。请使用管理员账号登录后重试。
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-16'
        } bg-black/40 border-r border-slate-800/60 transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        {/* Brand */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              🍬
            </button>
            {sidebarOpen && (
              <span className="font-bold text-[#00FF66] tracking-wide">管理后台</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-800/60">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
          >
            <span>←</span>
            {sidebarOpen && <span>返回前台</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400"
      >
        ☰
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-screen">{children}</main>
    </div>
  )
}
