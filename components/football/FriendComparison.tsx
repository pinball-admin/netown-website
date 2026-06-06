'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import LoginModal from '@/components/LoginModal'

interface ComparisonEntry {
  userId: string
  name: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  role: string
  ranking: number
  isMe: boolean
}

const avatarEmojis = ['🏆', '🥇', '🥈', '🥉', '⚡', '🔥', '🌟', '💫', '🎯', '💪']

export default function FriendComparison() {
  const { t } = useI18n()
  const { user, isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<{ me: ComparisonEntry; friends: ComparisonEntry[]; leaderboard: ComparisonEntry[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }
    fetch('/api/leaderboard/compare')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <span>👥</span>
          {t('leaderboard.friendComparison') || 'Friend Comparison'}
        </h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-3">🔒</div>
          <p className="text-slate-400 text-sm mb-3">{t('leaderboard.loginToCompare') || 'Log in to compare with friends'}</p>
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('auth.login') || 'Login'}
          </button>
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <span>👥</span>
          {t('leaderboard.friendComparison') || 'Friend Comparison'}
        </h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-700" />
              <div className="flex-1">
                <div className="h-3 bg-slate-700 rounded w-24 mb-1" />
                <div className="h-2 bg-slate-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const entries = data?.leaderboard || []
  const hasFriends = entries.length > 1 // More than just "me"

  if (!hasFriends) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <span>👥</span>
          {t('leaderboard.friendComparison') || 'Friend Comparison'}
        </h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-3">👀</div>
          <p className="text-slate-400 text-sm">{t('leaderboard.noFriendsYet') || 'Follow other users to compare!'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span>👥</span>
        {t('leaderboard.friendComparison') || 'Friend Comparison'}
      </h3>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
              entry.isMe
                ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30'
                : index < 3
                  ? 'bg-slate-800/60 border border-slate-700/50'
                  : 'bg-slate-800/30'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Rank */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${index === 0 ? 'bg-amber-500/30 text-amber-400' : ''}
                ${index === 1 ? 'bg-slate-400/30 text-slate-300' : ''}
                ${index === 2 ? 'bg-orange-600/30 text-orange-400' : ''}
                ${index >= 3 ? 'bg-slate-700/50 text-slate-500' : ''}
              `}>
                {entry.ranking}
              </div>

              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                entry.isMe
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'
              }`}>
                {entry.isMe ? '👤' : (avatarEmojis[index] || '⚽')}
              </div>

              {/* Name & Stats */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-medium truncate">
                    {entry.name}
                    {entry.isMe && (
                      <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold">
                        (YOU)
                      </span>
                    )}
                  </span>
                  {entry.role === 'master' && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] rounded-full font-medium">
                      Master
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{entry.totalPredictions} {t('ui.predictions') || 'pred'}</span>
                  <span>•</span>
                  <span className={entry.accuracy >= 50 ? 'text-emerald-400' : 'text-orange-400'}>
                    {entry.accuracy}%
                  </span>
                </div>
              </div>
            </div>

            {/* Candy Points */}
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-amber-400 font-bold text-sm">{entry.candyBalance}</div>
              <div className="text-[10px] text-slate-500">🍬</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
