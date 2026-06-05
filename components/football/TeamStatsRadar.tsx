'use client'

import { useI18n } from '@/contexts/I18nContext'

interface RadarData {
  attack: number
  defense: number
  possession: number
  form: number
  xg: number
}

interface TeamStatsRadarProps {
  data: RadarData
  teamName: string
  size?: number
}

const AXES = [
  { key: 'attack' as const, label: 'Attack' },
  { key: 'defense' as const, label: 'Defense' },
  { key: 'possession' as const, label: 'Possession' },
  { key: 'form' as const, label: 'Form' },
  { key: 'xg' as const, label: 'xG' },
]

export default function TeamStatsRadar({ data, teamName, size = 200 }: TeamStatsRadarProps) {
  const { t } = useI18n()
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 25
  const angleStep = (2 * Math.PI) / AXES.length
  const startAngle = -Math.PI / 2

  // Generate pentagon grid (5 levels)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  // Data polygon points
  const dataPoints = AXES.map((axis, i) => {
    const angle = startAngle + i * angleStep
    const value = data[axis.key] / 100
    const r = value * maxR
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: axis.label, value }
  })

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="max-w-full">
        {/* Grid pentagons */}
        {gridLevels.map((level) => {
          const points = AXES.map((_, i) => {
            const angle = startAngle + i * angleStep
            const r = level * maxR
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
          }).join(' ')
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="rgb(51 65 85)"
              strokeWidth="0.5"
              strokeDasharray={level === 1 ? '0' : '2,2'}
            />
          )
        })}
        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = startAngle + i * angleStep
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(angle)}
              y2={cy + maxR * Math.sin(angle)}
              stroke="rgb(51 65 85)"
              strokeWidth="0.5"
            />
          )
        })}
        {/* Level labels */}
        <text x={cx} y={cy - maxR - 5} textAnchor="middle" className="text-[7px] fill-slate-500">100</text>
        <text x={cx} y={cy - maxR * 0.4 - 2} textAnchor="middle" className="text-[6px] fill-slate-600">50</text>
        {/* Data polygon */}
        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(16, 185, 129, 0.15)"
          stroke="#10b981"
          strokeWidth="1.5"
        />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
        ))}
        {/* Axis labels */}
        {dataPoints.map((p, i) => {
          const angle = startAngle + i * angleStep
          const labelR = maxR + 16
          const lx = cx + labelR * Math.cos(angle)
          const ly = cy + labelR * Math.sin(angle)
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-slate-400"
            >
              {p.label}
            </text>
          )
        })}
      </svg>
      <span className="text-xs text-slate-500 mt-1">{teamName}</span>
    </div>
  )
}
