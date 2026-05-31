'use client'

import { useI18n } from '@/contexts/I18nContext'

interface ShopItem {
  id: number
  price: string
  image: string
  tagKey: string
  affiliateLink: string
}

const shopItems: ShopItem[] = [
  {
    id: 1,
    price: '$89.99',
    image: '⚽',
    tagKey: 'shopItems.argentinaJersey',
    affiliateLink: 'https://www.amazon.com/dp/EXAMPLE?tag=netown-20',
  },
  {
    id: 2,
    price: '$94.99',
    image: '🏆',
    tagKey: 'shopItems.brazilSamba',
    affiliateLink: 'https://www.amazon.com/dp/EXAMPLE?tag=netown-20',
  },
  {
    id: 3,
    price: '$84.99',
    image: '🥇',
    tagKey: 'shopItems.franceEuro',
    affiliateLink: 'https://www.amazon.com/dp/EXAMPLE?tag=netown-20',
  },
  {
    id: 4,
    price: '$79.99',
    image: '🦁',
    tagKey: 'shopItems.englandPremium',
    affiliateLink: 'https://www.amazon.com/dp/EXAMPLE?tag=netown-20',
  },
]

export default function FansShop() {
  const { t } = useI18n()

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="text-xl">🛒</span>
        {t('fansShop.title')}
      </h2>

      <div className="space-y-3">
        {shopItems.map((item) => (
          <a
            key={item.id}
            href={item.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-2xl">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                    item.id === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                    item.id === 2 ? 'bg-red-500/20 text-red-400' :
                    item.id === 3 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.id === 1 ? t('shopItems.bestSeller') :
                     item.id === 2 ? t('shopItems.hot') :
                     item.id === 3 ? t('shopItems.new') :
                     t('shopItems.limited')}
                  </span>
                </div>
                <p className="text-slate-200 text-sm font-medium truncate mt-1">{t(item.tagKey)}</p>
                <p className="text-amber-400 text-sm font-bold">{item.price}</p>
              </div>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-slate-500 text-xs text-center">
          🎁 {t('disclaimer.commission')}
        </p>
      </div>
    </div>
  )
}
