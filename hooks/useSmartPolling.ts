'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ScoreInfo {
  home: number
  away: number
  status: 'scheduled' | 'live' | 'ht' | 'ft' | 'finished'
  halfTime?: { home: number; away: number }
}

interface UseSmartPollingOptions {
  matchIds: string[]
  enabled?: boolean
}

interface UseSmartPollingResult {
  scores: Record<string, ScoreInfo>
  liveMatches: string[]
  isPolling: boolean
  refresh: () => void
}

const FAST_POLL_MS = 8000   // 8 seconds for live matches
const SLOW_POLL_MS = 45000  // 45 seconds for non-live

export function useSmartPolling({ matchIds, enabled = true }: UseSmartPollingOptions): UseSmartPollingResult {
  const [scores, setScores] = useState<Record<string, ScoreInfo>>({})
  const [liveMatches, setLiveMatches] = useState<string[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevScoresRef = useRef<Record<string, ScoreInfo>>({})

  const fetchScores = useCallback(async () => {
    if (!enabled || matchIds.length === 0) return

    setIsPolling(true)
    try {
      const ids = matchIds.join(',')
      const res = await fetch(`/api/matches/result?matchIds=${encodeURIComponent(ids)}`)
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.results) {
        const newScores: Record<string, ScoreInfo> = {}
        const live: string[] = []
        for (const r of json.results) {
          const matchId = String(r.matchId || r.id)
          newScores[matchId] = {
            home: r.homeScore ?? r.home ?? 0,
            away: r.awayScore ?? r.away ?? 0,
            status: r.status || 'scheduled',
            halfTime: r.halfTime,
          }
          if (r.status === 'live' || r.status === 'ht') {
            live.push(matchId)
          }
        }
        prevScoresRef.current = { ...scores, ...newScores }
        setScores((prev) => ({ ...prev, ...newScores }))
        setLiveMatches(live)
      }
    } catch {
      // Silently fail - polling is best-effort
    } finally {
      setIsPolling(false)
    }
  }, [matchIds, enabled])

  // Adjust polling interval based on whether any match is live
  useEffect(() => {
    if (!enabled) return

    const hasLive = liveMatches.length > 0
    const interval = hasLive ? FAST_POLL_MS : SLOW_POLL_MS

    // Initial fetch
    fetchScores()

    // Clear existing interval
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(fetchScores, interval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled, liveMatches.length, fetchScores])

  return {
    scores,
    liveMatches,
    isPolling,
    refresh: fetchScores,
  }
}
