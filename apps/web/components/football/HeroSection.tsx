'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'

const WORLD_CUP_DATE = new Date('2026-06-11T00:00:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft {
  const difference = WORLD_CUP_DATE.getTime() - new Date().getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export default function HeroSection() {
  const { t, language } = useI18n()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#00FF66]/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00FF66]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="mb-4">
          <span className="inline-block px-4 py-1.5 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-full text-[#00FF66] text-sm font-medium animate-pulse-glow">
            🏆 FIFA World Cup 2026
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-white">FIFA World Cup 2026</span>
          <br />
          <span className="text-cyber">AI Prediction Arena</span>
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          {mounted ? (
            <>
              <CountdownUnit value={timeLeft.days} label="Days" />
              <CountdownSeparator />
              <CountdownUnit value={timeLeft.hours} label="Hours" />
              <CountdownSeparator />
              <CountdownUnit value={timeLeft.minutes} label="Min" />
              <CountdownSeparator />
              <CountdownUnit value={timeLeft.seconds} label="Sec" />
            </>
          ) : (
            <>
              <CountdownUnit value={0} label="Days" />
              <CountdownSeparator />
              <CountdownUnit value={0} label="Hours" />
              <CountdownSeparator />
              <CountdownUnit value={0} label="Min" />
              <CountdownSeparator />
              <CountdownUnit value={0} label="Sec" />
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#schedule"
            className="btn-cyber flex items-center gap-2"
          >
            <span>📅</span>
            <span>{t('schedule.title')}</span>
          </a>
          <a
            href="#teams"
            className="px-4 py-2 bg-slate-800/50 text-slate-300 border border-slate-600 rounded-lg hover:border-[#00FF66]/50 hover:text-white transition-all duration-200"
          >
            🏟️ {t('teamMatrix.title')}
          </a>
        </div>
      </div>
    </div>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0a0a0a] border-2 border-[#00FF66]/40 rounded-xl flex items-center justify-center glow-green">
          <span className="text-3xl md:text-4xl font-bold text-cyber font-mono">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function CountdownSeparator() {
  return (
    <div className="flex items-center justify-center h-16 md:h-20">
      <span className="text-2xl text-[#00FF66] animate-pulse">:</span>
    </div>
  )
}
