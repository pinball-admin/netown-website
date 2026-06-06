'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { useUserStats } from '@/libs/data/swr-hooks'
import CandyPoints from '@/components/football/CandyPoints'
import MasterUpgradeWidget from '@/components/football/MasterUpgradeWidget'
import FansShop from '@/components/football/FansShop'
import GamersCorner from '@/components/football/GamersCorner'
import AdSenseAd from '@/components/football/AdSenseAd'
import LeaderboardWidget from '@/components/football/LeaderboardWidget'
import TerritorySidebarWidget from '@/components/football/TerritorySidebarWidget'
import FriendComparison from '@/components/football/FriendComparison'
import PersonalStatsDashboard from '@/components/football/PersonalStatsDashboard'
import SettlementHistory from '@/components/football/SettlementHistory'
import { SkeletonCard } from '@/components/ui/Skeleton'

interface HotPost {
  id: number
  title: string
  author: string
  likes: number
  comments: number
  time: string
  isHot?: boolean
}

const hotPosts: HotPost[] = [
  { id: 1, title: 'ui.hotPost1', author: 'ui.mockAuthor1', likes: 234, comments: 45, time: '2hAgo', isHot: true },
  { id: 2, title: 'ui.hotPost2', author: 'ui.mockAuthor2', likes: 189, comments: 32, time: '3hAgo', isHot: true },
  { id: 3, title: 'ui.hotPost3', author: 'ui.mockAuthor3', likes: 567, comments: 89, time: '4hAgo', isHot: true },
  { id: 4, title: 'ui.hotPost4', author: 'ui.mockAuthor4', likes: 345, comments: 67, time: '5hAgo', isHot: true },
  { id: 5, title: 'ui.hotPost5', author: 'ui.mockAuthor5', likes: 456, comments: 78, time: '6hAgo', isHot: true },
]

export default function RightSidebar() {
  const { user, isLoggedIn } = useAuth()
  const { t } = useI18n()
  const [expandedSection, setExpandedSection] = useState<'hotPosts' | 'leaderboard'>('hotPosts')

  // Fetch user stats via SWR (auto-revalidates, handles loading/error)
  const { data: statsData, isLoading: statsLoading } = useUserStats()
  const userStats = statsData?.success ? statsData.stats : null

  return (
    <div className="space-y-6">
      {/* Candy Points */}
      <CandyPoints />

      {/* AdSense - Between Candy & Stats */}
      <AdSenseAd adSlot="1234567894" adFormat="rectangle" className="rounded-xl overflow-hidden" />

      {/* Personal Stats Dashboard (logged in users) */}
      {isLoggedIn && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            📊 {t('stats.personalStats')}
          </h2>
          {statsLoading ? (
            <SkeletonCard />
          ) : userStats ? (
            <PersonalStatsDashboard stats={userStats} />
          ) : (
            <div className="text-sm text-slate-500 text-center py-4">
              {t('stats.noData')}
            </div>
          )}
        </div>
      )}
      <SettlementHistory />

      {/* Hot Posts */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            🔥 {t('ui.hotTopics')}
          </h2>
          <button
            onClick={() => setExpandedSection(expandedSection === 'hotPosts' ? 'leaderboard' : 'hotPosts')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            {expandedSection === 'hotPosts' ? t('ui.showLeaderboard') : t('ui.showHotPosts')}
          </button>
        </div>

        {expandedSection === 'hotPosts' ? (
          <div className="space-y-3">
            {hotPosts.map((post) => (
              <Link
                key={post.id}
                href={`/football/forum?post=${post.id}`}
                className="block p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <p className="text-slate-300 text-sm line-clamp-2 mb-2">{t(post.title)}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="text-slate-300">{t(post.author)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{post.time.replace('hAgo', t('ui.hAgo'))}</div>
              </Link>
            ))}
          </div>
        ) : (
          <LeaderboardWidget />
        )}

        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <Link 
            href="/football/forum"
            className="w-full py-2.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('ui.joinDiscussion')}</span>
            <span>💬</span>
          </Link>
        </div>
      </div>

      <TerritorySidebarWidget />

      <MasterUpgradeWidget />

      <FriendComparison />

      {/* Google AdSense - Sidebar Ad Unit */}
      <AdSenseAd adSlot="1234567893" adFormat="rectangle" className="rounded-xl overflow-hidden" />

      {/* Nike/Adidas Affiliate Ad */}
      <a
        href="https://www.amazon.com/s?k=nike+world+cup+2026+football&tag=netown-20"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-br from-black to-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white text-lg font-bold">⚽ NIKE</div>
            <div className="text-amber-400 text-xs bg-amber-500/10 px-2 py-1 rounded">{t('ui.sponsored')}</div>
          </div>
          <div className="text-white text-sm mb-3">{t('ui.officialWorldCupGear')}</div>
          <div className="text-slate-400 text-xs mb-4">{t('ui.getAuthenticMerch')}</div>
          <div className="w-full py-2.5 bg-white text-black font-semibold text-sm rounded-lg hover:bg-gray-200 transition-all duration-300 text-center">
            {t('ui.shopNow')}
          </div>
        </div>
      </a>

      {/* Fans Shop */}
      <FansShop />

      {/* Gamers Corner */}
      <GamersCorner />
    </div>
  )
}