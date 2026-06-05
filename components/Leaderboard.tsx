'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface LeaderboardEntry {
  userId: string
  name: string
  candyBalance: number
  totalPredictions: number
  correctPredictions: number
  role: 'user' | 'master' | 'admin'
  ranking: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()
        if (result.success) {
          setLeaderboard(result.leaderboard)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-2 border-[#00FF66] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-black/50 border border-slate-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏆</span> {t('ui.userLeaderboard')}
      </h3>
      
      {leaderboard.length === 0 ? (
        <p className="text-slate-500 text-center py-4">{t('ui.noUsersYet')}</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((user, index) => {
            const accuracy = user.totalPredictions > 0 
              ? Math.round((user.correctPredictions / user.totalPredictions) * 100) 
              : 0
            
            return (
              <div
                key={user.userId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  index < 3 ? 'bg-[#00FF66]/10 border border-[#00FF66]/30' : 'bg-slate-900/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-slate-400 text-black' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-slate-700 text-white'
                }`}>
                  {user.ranking}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{user.name}</span>
                    {user.role === 'master' && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {t('ui.masterBadge')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.totalPredictions} {t('ui.predictionsLabel')} · {accuracy}% {t('ui.accuracyLabel2')}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">🍬 {user.candyBalance.toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
