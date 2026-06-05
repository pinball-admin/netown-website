'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  leaving: boolean
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
})

const COLORS: Record<ToastType, string> = {
  success: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400',
  error: 'border-red-500/50 bg-red-500/20 text-red-400',
  info: 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400',
  warning: 'border-amber-500/50 bg-amber-500/20 text-amber-400',
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const removeToast = useCallback((id: string) => {
    // Mark as leaving first for exit animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => {
        // Keep max 3 toasts, remove oldest
        const next = [...prev, { id, message, type, duration, leaving: false }]
        if (next.length > 3) {
          // Mark the oldest as leaving
          next[0] = { ...next[0], leaving: true }
          setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== next[0].id))
          }, 300)
        }
        return next
      })

      setTimeout(() => removeToast(id), duration)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div
        ref={containerRef}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md text-sm font-medium shadow-lg transition-all duration-300 max-w-[90vw] sm:max-w-md ${
              COLORS[t.type]
            } ${t.leaving ? 'opacity-0 -translate-y-2 scale-95' : 'animate-slideDown'}`}
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs">
              {ICONS[t.type]}
            </span>
            <span className="truncate">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
