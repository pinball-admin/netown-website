'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface DynamicAdBannerProps {
  teamId: string
  teamName: string
  teamFlag: string
  variant?: 'top' | 'bottom' | 'inline' | 'side'
  scriptSlot?: string
  imageUrl?: string
  isScrollTriggered?: boolean
  showOnMainDashboard?: boolean
  hideIfEmpty?: boolean
  className?: string
}

const teamAds: Record<string, {
  headline: string
  subtext: string
  cta: string
  link: string
  badge: string
}> = {
  'argentina': {
    headline: 'Grab Your Official Argentina 3-Star Kit',
    subtext: 'Limited Stock at Kitbag — Show Your Passion for La Albiceleste',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=argentina+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'brazil': {
    headline: 'Support Brazil — Get the Samba Collection',
    subtext: 'Official Brazil World Cup Gear — Neymar & Vinicius Jerseys',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=brazil+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'france': {
    headline: 'Support Les Bleus — New France World Cup Jersey',
    subtext: 'Official France 2026 Kit — Mbappe Edition Available Now',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=france+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'england': {
    headline: 'England Three Lions — 2026 Home & Away Kits',
    subtext: 'Official England Merchandise — Kane, Rice, Foden Jerseys',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=england+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'usa': {
    headline: 'USA Soccer — Stars & Stripes Collection',
    subtext: 'Official USMNT Gear — Pulisic & Reyna Jerseys',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=usa+soccer+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'germany': {
    headline: 'Germany Die Mannschaft — 2026 Collection',
    subtext: 'Official Germany Jersey — Neuer, Kroos, Havertz',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=germany+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'spain': {
    headline: 'Spain La Roja — Euro Champions Collection',
    subtext: 'Official Spain 2026 Kit — Rodri, Gavi, Morata',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=spain+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'portugal': {
    headline: 'Portugal Selecao — CR7 Era Collection',
    subtext: 'Official Portugal Gear — Ronaldo Legacy Jerseys',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=portugal+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'netherlands': {
    headline: 'Netherlands Oranje — 2026 Collection',
    subtext: 'Official Netherlands Jersey — Van Dijk, de Jong',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=netherlands+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'morocco': {
    headline: 'Morocco Atlas Lions — Desert Warriors Gear',
    subtext: 'Official Morocco 2026 Kit — Hakimi, Ziyech',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=morocco+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'croatia': {
    headline: 'Croatia Vatreni — Checkered Warriors',
    subtext: 'Official Croatia Jersey — Modric, Kovacic',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=croatia+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
  'japan': {
    headline: 'Japan Samurai Blue — 2026 Collection',
    subtext: 'Official Japan Jersey — Kamada, Minamino',
    cta: 'Shop Now',
    link: 'https://www.amazon.com/s?k=japan+world+cup+jersey+2026&tag=netown-20',
    badge: 'Official Partner',
  },
}

const defaultAd = {
  headline: 'World Cup 2026 Official Merchandise',
  subtext: 'Get Your National Team Gear — jerseys, scarves, flags & more',
  cta: 'Shop Now',
  link: 'https://www.amazon.com/s?k=world+cup+2026+merchandise&tag=netown-20',
  badge: 'Sponsored',
}

export default function DynamicAdBanner({
  teamId,
  teamName,
  teamFlag,
  variant = 'inline',
  scriptSlot,
  imageUrl,
  isScrollTriggered = false,
  showOnMainDashboard = true,
  hideIfEmpty = false,
}: DynamicAdBannerProps) {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(!isScrollTriggered)
  const [hasScrolledPast, setHasScrolledPast] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isScrollTriggered) return

    const handleScroll = () => {
      if (!adRef.current) return
      const rect = adRef.current.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (isInViewport && !hasScrolledPast) {
        setHasScrolledPast(true)
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isScrollTriggered, hasScrolledPast])

  const ad = teamAds[teamId] || {
    headline: t('ad.worldCupMerchandise'),
    subtext: t('ad.getYourGear'),
    cta: t('ad.shopNow'),
    link: 'https://www.amazon.com/s?k=world+cup+2026+merchandise&tag=netown-20',
    badge: t('ad.sponsored'),
  }

  // 检查是否有内容要显示
  const hasContent = scriptSlot || imageUrl || (ad && ad.headline)

  if (!showOnMainDashboard && variant === 'bottom') {
    return null
  }

  if (!isVisible) return null
  
  // 如果设置了隐藏空广告，并且没有内容，则不显示
  if (hideIfEmpty && !hasContent) {
    return null
  }

  const containerClass = variant === 'top'
    ? 'mb-6'
    : variant === 'bottom'
      ? 'mt-6'
      : 'my-6'

  return (
    <div ref={adRef} className={`dynamic-ad-container ${containerClass}`}>
      {scriptSlot ? (
        <div className="ad-script-wrapper bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div dangerouslySetInnerHTML={{ __html: scriptSlot }} />
        </div>
      ) : imageUrl ? (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ad-image-wrapper group block"
        >
          <img
            src={imageUrl}
            alt={ad.headline}
            className="w-full h-auto rounded-xl"
          />
        </a>
      ) : (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-semibold rounded">
                  [{t('ad.sponsored') || 'Sponsored'}]
                </span>
                <span className="text-slate-500 text-[10px]">{ad.badge}</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-1 group-hover:text-amber-300 transition-colors">
                {teamFlag} {ad.headline}
              </h3>
              <p className="text-slate-400 text-xs">{ad.subtext}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xl">🛍️</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <span className="text-amber-400 text-xs font-semibold group-hover:text-amber-300 transition-colors">
              {ad.cta} →
            </span>
          </div>
        </a>
      )}
    </div>
  )
}
