'use client'

interface LiveScoreBadgeProps {
  status: 'live' | 'ht' | 'ft'
  className?: string
}

export default function LiveScoreBadge({ status, className = '' }: LiveScoreBadgeProps) {
  const labels: Record<string, string> = {
    live: 'LIVE',
    ht: 'HT',
    ft: 'FT',
  }

  const colors: Record<string, string> = {
    live: 'bg-red-500/20 text-red-400 border-red-500/30',
    ht: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[status]} ${className}`}>
      {status === 'live' && (
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      )}
      {labels[status]}
    </span>
  )
}
