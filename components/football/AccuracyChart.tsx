'use client'

import { useI18n } from '@/contexts/I18nContext'

interface AccuracyChartProps {
  data: { date: string; accuracy: number }[]
  height?: number
}

export default function AccuracyChart({ data, height = 120 }: AccuracyChartProps) {
  const { t } = useI18n()

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height }}>
        {t('stats.noData')}
      </div>
    )
  }

  const padding = { top: 10, right: 10, bottom: 20, left: 30 }
  const chartWidth = 300
  const chartHeight = height
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const values = data.map((d) => d.accuracy)
  const minVal = Math.max(0, Math.min(...values) - 10)
  const maxVal = Math.min(100, Math.max(...values) + 10)
  const valRange = maxVal - minVal || 1

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth
    const y = padding.top + plotHeight - ((d.accuracy - minVal) / valRange) * plotHeight
    return `${x},${y}`
  })

  const linePath = `M${points.join(' L')}`
  
  // Area fill path
  const areaPath = data.length > 1
    ? `M${padding.left},${padding.top + plotHeight} L${points.join(' L')} L${padding.left + plotWidth},${padding.top + plotHeight} Z`
    : ''

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ height }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + plotHeight * (1 - pct)
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="rgb(51 65 85)" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x={padding.left - 4} y={y + 4} textAnchor="end" className="text-[8px] fill-slate-500">
                {Math.round(minVal + pct * valRange)}%
              </text>
            </g>
          )
        })}
        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#accGradient)" opacity="0.3" />
        )}
        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#accLineGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => {
          const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth
          const y = padding.top + plotHeight - ((d.accuracy - minVal) / valRange) * plotHeight
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
              {/* Date label for first and last */}
              {(i === 0 || i === data.length - 1) && (
                <text x={x} y={chartHeight - 2} textAnchor={i === 0 ? 'start' : 'end'} className="text-[7px] fill-slate-500">
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          )
        })}
        <defs>
          <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="accLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
