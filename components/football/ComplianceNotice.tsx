'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'

export default function ComplianceNotice() {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUserCountry = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch('https://ipapi.co/json/', {
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data && data.country_code === 'CN') {
            setIsVisible(true)
          }
        }
      } catch (error) {
        console.log('IP detection skipped')
      } finally {
        setIsLoading(false)
      }
    }

    checkUserCountry()
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (isLoading || !isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[300] animate-slideDown">
      <div className="bg-gradient-to-r from-amber-600/95 via-orange-600/95 to-red-600/95 backdrop-blur-md border-b border-amber-400/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <span className="text-2xl">🛡️</span>
              </div>
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                {t('compliance.restrictedRegion')}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
