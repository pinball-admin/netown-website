'use client'

import { useGeo } from '@/contexts/GeoContext'

interface CandyBalanceProps {
  balance: number
  region?: string
}

export default function CandyBalance({ balance, region }: CandyBalanceProps) {
  const { isCN } = useGeo()
  const isChina = isCN || region === 'CN'

  return (
    <div className="flex items-center gap-2 bg-black/50 border border-slate-800 rounded-xl px-3 py-1.5">
      <span className="text-xl">🍬</span>
      <div className="flex flex-col">
        <span className="text-white font-bold">{balance.toLocaleString()}</span>
        <span className="text-xs text-slate-500">
          {isChina ? '站内纯净积分' : 'Candy Points'}
        </span>
      </div>
    </div>
  )
}