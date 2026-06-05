'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  disabled?: boolean
  threshold?: number
}

export function usePullToRefresh({ onRefresh, disabled = false, threshold = 60 }: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return
    if (window.scrollY > 0) return // Only at top of page
    touchStartY.current = e.touches[0].clientY
    isPulling.current = true
  }, [disabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || disabled) return
    const delta = (e.touches[0].clientY - touchStartY.current) * 0.5 // Dampen
    if (delta > 0) {
      setPullDistance(Math.min(delta, 120))
    }
  }, [disabled])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || disabled) return
    isPulling.current = false

    if (pullDistance >= threshold) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, threshold, disabled, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const PullIndicator = () => {
    if (pullDistance === 0 && !refreshing) return null
    return (
      <div
        className="flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{ height: pullDistance > 0 || refreshing ? Math.max(pullDistance, 48) : 0 }}
      >
        <div className={`flex items-center gap-2 text-emerald-400 text-sm ${refreshing ? 'animate-spin' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
        </div>
      </div>
    )
  }

  return {
    containerRef,
    refreshing,
    PullIndicator,
  }
}
