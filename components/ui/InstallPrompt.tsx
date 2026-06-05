'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'

export default function InstallPrompt() {
  const { t } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if not already installed and not dismissed recently
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fadeInUp">
      <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-sm">{t('pwa.installTitle')}</h4>
            <p className="text-slate-400 text-xs mt-1">{t('pwa.installDesc')}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all"
              >
                {t('pwa.install')}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-slate-500 text-xs hover:text-slate-400 transition-colors"
              >
                {t('pwa.later')}
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
