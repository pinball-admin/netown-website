'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export default function CandyPoints() {
  const { t } = useI18n()
  const { user, isLoggedIn, refreshUser } = useAuth()
  const { toast } = useToast()
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<Array<{
    rank: number
    name: string
    score: number
    isCurrentUser: boolean
  }>>([])

  const candy = user?.candyBalance || 0
  const streak = user?.currentStreak || 0

  // Fetch leaderboard from API
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.leaderboard) {
          setLeaderboardData(
            data.leaderboard.slice(0, 5).map((u: any, i: number) => ({
              rank: i + 1,
              name: u.name,
              score: u.candyBalance,
              isCurrentUser: u.userId === user?.id,
            }))
          )
        }
      }
    } catch {
      // Fallback: show current user only
      if (user) {
        setLeaderboardData([
          { rank: 1, name: user.name, score: user.candyBalance, isCurrentUser: true },
        ])
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeaderboard()
      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0]
      if (user?.lastLoginDate === today) {
        setCheckedIn(true)
      }
    }
  }, [isLoggedIn, user?.lastLoginDate, fetchLeaderboard])

  const handleCheckIn = async () => {
    if (checkedIn || checkingIn || !isLoggedIn) return

    setCheckingIn(true)
    try {
      const res = await fetch('/api/candy/daily-login', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setCheckedIn(true)
        toast(
          data.bonus > 0
            ? `${t('candyPoints.toastMessage')} +${data.bonus} 🍬`
            : t('candyPoints.checkedIn'),
          'success'
        )
        // Refresh user data to get updated balance
        await refreshUser()
        // Refresh leaderboard
        await fetchLeaderboard()
      }
    } catch (error) {
      console.error('Check-in failed:', error)
    } finally {
      setCheckingIn(false)
    }
  }

  // Default leaderboard if no data loaded
  const displayLeaderboard = leaderboardData.length > 0
    ? leaderboardData
    : [
        { rank: 1, name: 'PredictorKing_UK', score: 4820, isCurrentUser: false },
        { rank: 2, name: 'TacticsMaster_DE', score: 3650, isCurrentUser: false },
        { rank: 3, name: 'Predator_Brazil', score: 2890, isCurrentUser: false },
        { rank: 4, name: 'DataWhiz_USA', score: 2450, isCurrentUser: false },
        ...(isLoggedIn && user
          ? [{ rank: 5, name: user.name, score: candy, isCurrentUser: true }]
          : []),
      ]

  return (
    <div className="space-y-5">
        {/* Candy Points Status */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
              <span className="text-xl">🍬</span>
              {t('candyPoints.title')}
            </h2>
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <span className="text-amber-400 font-bold text-sm">{streak} {t('candyPoints.dayStreak')}</span>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{t('candyPoints.yourCandy')}</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  {candy.toLocaleString()}
                </span>
                <span className="text-amber-500 text-lg">🍬</span>
              </div>
            </div>
          </div>

          {/* Daily Check-in Button */}
          {isLoggedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={checkedIn || checkingIn}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                checkedIn
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-orange-400 active:scale-95'
              }`}
            >
              {checkingIn ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{t('candyPoints.processing')}</span>
                </>
              ) : checkedIn ? (
                <>
                  <span className="text-lg">✓</span>
                  <span>{t('candyPoints.checkedIn')}</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🍬</span>
                  <span>{t('candyPoints.dailyCheckIn')}</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-center text-sm text-slate-500 py-2">
              {t('candyPoints.loginEarn')}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            {t('candyPoints.predictionMasters')}
          </h2>

          <div className="space-y-2">
            {displayLeaderboard.map((entry, index) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  entry.isCurrentUser
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-slate-800/40 border border-transparent hover:border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    index === 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : index === 1
                        ? 'bg-slate-400/20 text-slate-300'
                        : index === 2
                          ? 'bg-orange-600/20 text-orange-400'
                          : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {entry.rank}
                  </div>
                  <span
                    className={`text-sm font-medium truncate ${
                      entry.isCurrentUser ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {entry.isCurrentUser ? t('candyPoints.you') : entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <span className={`font-bold text-sm ${
                    entry.isCurrentUser ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="text-amber-500/60 text-xs">🍬</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
          <p className="text-slate-500 text-xs leading-relaxed text-center">
            {t('candyPoints.info')}
          </p>
        </div>
      </div>
  )
}
