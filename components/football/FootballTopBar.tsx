'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import LanguageSwitcher from '@/components/football/LanguageSwitcher'
import ConnectWalletButton from '@/components/football/ConnectWalletButton'

type NavKey = 'dashboard' | 'schedule' | 'teams' | 'forum' | 'predictionsN' | 'bracket' | 'territories'
const NAV_ITEMS: { href: string; key: NavKey; match: (p: string) => boolean }[] = [
  { href: '/football', key: 'dashboard', match: (p: string) => p === '/football' },
  { href: '/football/schedule', key: 'schedule', match: (p: string) => p.startsWith('/football/schedule') },
  { href: '/teams', key: 'teams', match: (p: string) => p === '/teams' || p.startsWith('/football/teams') },
  { href: '/football/bracket', key: 'bracket', match: (p: string) => p.startsWith('/football/bracket') },
  { href: '/football/forum', key: 'forum', match: (p: string) => p.startsWith('/football/forum') },
  { href: '/football/territories', key: 'territories', match: (p: string) => p.startsWith('/football/territories') },
  { href: '/football/predictions', key: 'predictionsN', match: (p: string) => p.startsWith('/football/predictions') },
]

export default function FootballTopBar() {
  const { t } = useI18n()
  const { user } = useAuth()
  const pathname = usePathname()
  const { isSupported, isSubscribed, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t('nav.backToTown')}</span>
          </Link>
          <div className="h-4 w-px bg-slate-700 flex-shrink-0 hidden sm:block" />
          <div className="hidden md:flex gap-3 sm:gap-4 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap transition-colors ${
                    active ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Notification Bell */}
          {isSupported && user && (
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
              className={`p-2 rounded-lg transition-all ${
                isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}
              title={isSubscribed ? t('notifications.enabled') : t('notifications.enable')}
            >
              <svg className="w-4 h-4" fill={isSubscribed ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          )}
          <ConnectWalletButton />
          <LanguageSwitcher />
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/football/settings"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
                title={t('nav.settings') || 'Settings'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 hidden md:inline">{user.displayName || user.name}</span>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="ml-2 px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md hover:bg-emerald-500/30 transition-all"
                  >
                    管理
                  </Link>
                )}
              </div>
          )}
        </div>
      </div>
    </nav>
  )
}
