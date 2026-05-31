'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface ToastProps {
  message: string
  isVisible: boolean
}

function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-slideDown">
      <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md border border-amber-400/50 rounded-xl px-6 py-4 shadow-2xl shadow-amber-500/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍬</span>
          <p className="text-white font-semibold">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default function CandyPoints() {
  const { t } = useI18n()
  const [candy, setCandy] = useState(120)
  const [checkedIn, setCheckedIn] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [streak, setStreak] = useState(3)

  const leaderboard = [
    { rank: 1, nameKey: 'cryptoKing_UK', score: 4820 },
    { rank: 2, nameKey: 'tacticsMaster_DE', score: 3650 },
    { rank: 3, nameKey: 'predator_Brazil', score: 2890 },
    { rank: 4, nameKey: 'dataWhiz_USA', score: 2450 },
    { rank: 5, nameKey: 'you', score: candy },
  ]

  const handleCheckIn = () => {
    if (checkedIn) return

    setCheckedIn(true)
    setCandy(prev => prev + 10)
    setStreak(prev => prev + 1)
    setToastMessage(t('candyPoints.toastMessage'))
    setShowToast(true)

    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  useEffect(() => {
    const today = new Date().toDateString()
    const lastCheckIn = localStorage.getItem('lastCheckIn')
    if (lastCheckIn === today) {
      setCheckedIn(true)
    }
  }, [])

  useEffect(() => {
    if (checkedIn) {
      localStorage.setItem('lastCheckIn', new Date().toDateString())
    }
  }, [checkedIn])

  return (
    <>
      <Toast message={toastMessage} isVisible={showToast} />

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
                  {candy}
                </span>
                <span className="text-amber-500 text-lg">🍬</span>
              </div>
            </div>
          </div>

          {/* Daily Check-in Button */}
          <button
            onClick={handleCheckIn}
            disabled={checkedIn}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              checkedIn
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-orange-400 active:scale-95'
            }`}
          >
            {checkedIn ? (
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
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            {t('candyPoints.predictionMasters')}
          </h2>

          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  user.nameKey === 'you'
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
                    {user.rank}
                  </div>
                  <span 
                    className={`text-sm font-medium truncate ${
                      user.nameKey === 'you' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                    title={user.nameKey === 'you' ? t('candyPoints.you') : t(`candyPoints.leaderboardNames.${user.nameKey}`)}
                  >
                    {user.nameKey === 'you' ? t('candyPoints.you') : t(`candyPoints.leaderboardNames.${user.nameKey}`)}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <span className={`font-bold text-sm ${
                    user.nameKey === 'you' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {user.score.toLocaleString()}
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
    </>
  )
}
