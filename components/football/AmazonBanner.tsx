'use client'

import { useI18n } from '@/contexts/I18nContext'
import { useGeo } from '@/contexts/GeoContext'

interface ShopItem {
  id: number
  name: string
  price: string
  emoji: string
  tag: string
  linkUS: string
  linkUK: string
}

const shopItems: ShopItem[] = [
  {
    id: 1,
    name: 'Argentina Home Jersey 2026',
    price: '$89.99 / £74.99',
    emoji: '🇦🇷',
    tag: 'BEST SELLER',
    linkUS: 'https://www.amazon.com/s?k=argentina+world+cup+jersey+2026&tag=netown-20',
    linkUK: 'https://www.amazon.co.uk/s?k=argentina+world+cup+jersey+2026&tag=netownuk-21',
  },
  {
    id: 2,
    name: 'Nike Phantom GX Elite FG',
    price: '$274.99 / £229.99',
    emoji: '⚽',
    tag: 'TOP BOOTS',
    linkUS: 'https://www.amazon.com/s?k=nike+phantom+gx+elite+football+boots&tag=netown-20',
    linkUK: 'https://www.amazon.co.uk/s?k=nike+phantom+gx+elite+football+boots&tag=netownuk-21',
  },
  {
    id: 3,
    name: 'England Home Kit 2026',
    price: '$84.99 / £69.99',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tag: 'POPULAR',
    linkUS: 'https://www.amazon.com/s?k=england+world+cup+jersey+2026&tag=netown-20',
    linkUK: 'https://www.amazon.co.uk/s?k=england+world+cup+jersey+2026&tag=netownuk-21',
  },
  {
    id: 4,
    name: 'adidas Predator Elite FG',
    price: '$299.99 / £249.99',
    emoji: '👟',
    tag: 'NEW',
    linkUS: 'https://www.amazon.com/s?k=adidas+predator+elite+football+boots&tag=netown-20',
    linkUK: 'https://www.amazon.co.uk/s?k=adidas+predator+elite+football+boots&tag=netownuk-21',
  },
  {
    id: 5,
    name: 'France Home Jersey 2026',
    price: '$89.99 / £74.99',
    emoji: '🇫🇷',
    tag: 'HOT',
    linkUS: 'https://www.amazon.com/s?k=france+world+cup+jersey+2026&tag=netown-20',
    linkUK: 'https://www.amazon.co.uk/s?k=france+world+cup+jersey+2026&tag=netownuk-21',
  },
  {
    id: 6,
    name: 'Brazil Away Kit 2026',
    price: '$84.99 / £69.99',
    emoji: '🇧🇷',
    tag: 'LIMITED',
    linkUS: 'https://www.amazon.com/s?k=brazil+world+cup+away+jersey+2026&tag=netown-20',
    linkUK: 'https://www.amazon.co.uk/s?k=brazil+world+cup+away+jersey+2026&tag=netownuk-21',
  },
]

export default function AmazonBanner() {
  const { t } = useI18n()
  const { isCN } = useGeo()

  // No commerce ads for CN region
  if (isCN) return null

  return (
    <div className="space-y-4">
      {/* Main Banner */}
      <a
        href="https://www.amazon.com/s?k=world+cup+2026+football+merchandise&tag=netown-20"
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">▼</span>
            </div>
            <div>
              <p className="text-orange-400 text-xs font-medium uppercase tracking-wider">
                {t('amazonSection.title')}
              </p>
              <p className="text-white font-semibold">{t('amazonSection.worldCupGear')}</p>
              <p className="text-slate-500 text-xs mt-0.5">{t('ui.jerseysBootsScarves')}</p>
            </div>
          </div>
          <span className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/20">
            {t('amazonSection.shopNow')} →
          </span>
        </div>
      </a>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-2">
        {shopItems.slice(0, 4).map((item) => (
          <a
            key={item.id}
            href={item.linkUS}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-amber-500/30 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{item.emoji}</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                item.tag === 'BEST SELLER' ? 'bg-emerald-500/20 text-emerald-400' :
                item.tag === 'TOP BOOTS' ? 'bg-purple-500/20 text-purple-400' :
                item.tag === 'POPULAR' ? 'bg-blue-500/20 text-blue-400' :
                item.tag === 'HOT' ? 'bg-red-500/20 text-red-400' :
                item.tag === 'NEW' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {item.tag}
              </span>
            </div>
            <p className="text-slate-200 text-xs font-medium truncate">{item.name}</p>
            <p className="text-amber-400 text-xs font-bold mt-0.5">{item.price}</p>
          </a>
        ))}
      </div>

      {/* UK Sports Direct / Kitbag Link */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">UK</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">{t('ui.ukFootballShop')}</p>
              <p className="text-slate-500 text-[10px]">{t('ui.ukShopRetailers')}</p>
            </div>
          </div>
          <a
            href="https://www.kitbag.com/football/world-cup/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-500/30 transition-colors"
          >
            {t('ui.shopUK')}
          </a>
        </div>
      </div>

      {/* Commission disclaimer */}
      <p className="text-slate-600 text-[10px] text-center">
        {t('ui.affiliateDisclaimer')}
      </p>
    </div>
  )
}
