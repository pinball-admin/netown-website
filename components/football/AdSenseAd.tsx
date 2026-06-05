'use client'

import { useEffect, useRef } from 'react'
import { useGeo } from '@/contexts/GeoContext'
import { useI18n } from '@/contexts/I18nContext'

interface AdSenseAdProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
}

/**
 * Google AdSense ad unit component
 * 
 * Usage:
 * <AdSenseAd adSlot="1234567890" adFormat="auto" />
 * 
 * Get your ad-slot IDs from: https://www.google.com/adsense/new/u/0/pub-5668130183212955/adunits
 */
export default function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
}: AdSenseAdProps) {
  const { isCN } = useGeo()
  const { t } = useI18n()
  const adRef = useRef<HTMLDivElement>(null)
  const isPushed = useRef(false)

  // No ads for CN region
  if (isCN) return null

  useEffect(() => {
    if (isPushed.current) return
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      isPushed.current = true
    } catch (e) {
      console.error('[AdSense] Ad push failed:', e)
    }
  }, [])

  return (
    <div
      ref={adRef}
      className={`adsense-container ${className}`}
    >
      <div className="mb-1">
        <span className="text-slate-600 text-[10px] uppercase tracking-wider">{t('ui.advertisement')}</span>
      </div>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-5668130183212955"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
