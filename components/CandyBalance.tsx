'use client'

import { useState, useEffect } from 'react'
import { useGeo } from '@/contexts/GeoContext'

interface CandyBalanceProps {
  userId: string
}

export default function CandyBalance({ userId }: CandyBalanceProps) {
  const [balance, setBalance] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const { isCN } = useGeo()

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`/api/candy/transactions?userId=${userId}`)
        const result = await response.json()
        if (result.success && result.transactions.length > 0) {
          let total = 100
          result.transactions.forEach((tx: any) => {
            total += tx.amount
          })
          setBalance(total)
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      }
      setLoading(false)
    }

    fetchBalance()
  }, [userId])

  const handleDailyLogin = async () => {
    try {
      const response = await fetch('/api/candy/daily-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const result = await response.json()
      if (result.success) {
        setBalance(result.balance)
        setStreak(result.streak)
      }
    } catch (error) {
      console.error('Failed to process daily login:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-yellow-400">🍬</span>
        <span className="text-slate-400">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-black/50 border border-slate-800 rounded-xl px-4 py-2">
      <span className="text-2xl">🍬</span>
      <div className="flex flex-col">
        <span className="text-white font-bold text-lg">{balance.toLocaleString()}</span>
        <span className="text-xs text-slate-500">
          {isCN ? '站内纯净积分' : 'Candy Points'}
        </span>
        {streak > 1 && (
          <span className="text-xs text-yellow-400">🔥 {streak} day streak</span>
        )}
      </div>
      <button
        onClick={handleDailyLogin}
        className="ml-2 px-3 py-1 bg-[#00FF66]/20 text-[#00FF66] text-sm rounded-lg hover:bg-[#00FF66]/30 transition-colors"
      >
        {isCN ? '签到' : 'Daily'}
      </button>
    </div>
  )
}
