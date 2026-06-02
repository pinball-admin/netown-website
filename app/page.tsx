'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { Language, languages as languageOptions } from '@/contexts/I18nContext'
import { useCompliance } from '@/contexts/ComplianceContext'
import { useAuth } from '@/contexts/AuthContext'
import AIExpertsSection, { ExpertStats } from '@/components/AIExpertsSection'
import { usePrediction } from '@/contexts/PredictionContext'
import { ExpertId } from '@/libs/types'
import { MODULES } from '@/config/modules'
import LoginModal from '@/components/LoginModal'
import CandyBalance from '@/components/CandyBalance'

const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
  ja: '🇯🇵',
  ko: '🇰🇷',
  pt: '🇧🇷',
  zh: '🇨🇳',
}

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { t, language, setLanguage } = useI18n()
  const { isPureDataMode, isWeb3Enabled } = useCompliance()
  const { user, isLoggedIn, logout } = useAuth()
  const { expertStats, championExpert, demotedExperts, expertRanking } = usePrediction()

  const isChinese = language === 'zh'
  const brandName = t('brand.name') || 'Netown'
  const brandSlogan = t('brand.slogan') || 'Stick together, kick together.'

  const statsMap: Record<ExpertId, ExpertStats> = {} as Record<ExpertId, ExpertStats>
  Object.entries(expertStats).forEach(([key, value]) => {
    statsMap[key as ExpertId] = value as ExpertStats
  })

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px)] bg-[linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo - Cyber Candy */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.5)]">
              <span className="text-2xl transform rotate-15">🍬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00FF66] to-green-400 bg-clip-text text-transparent">
                {isChinese ? '奶糖网' : 'Netown'}
              </h1>
              <p className="text-xs text-slate-500">
                {isChinese ? 'Netown Arena' : 'Stick together, kick together.'}
              </p>
            </div>
          </div>

          {/* Auth & Language */}
          <div className="flex items-center gap-3">
            {isLoggedIn && user && (
              <CandyBalance balance={user.candyBalance} region={user.region} />
            )}
            
            {isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Hi, {user.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {isChinese ? '登出' : 'Logout'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 text-sm text-slate-300 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200"
              >
                {isChinese ? '登录' : 'Log In'}
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => {
                const currentIndex = languageOptions.findIndex(l => l.code === language)
                const nextIndex = (currentIndex + 1) % languageOptions.length
                setLanguage(languageOptions[nextIndex].code)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm border border-zinc-700 rounded-lg text-slate-300 hover:border-[#00FF66]/50 hover:text-white transition-all duration-200"
            >
              <span className="text-lg">{languageFlags[language]}</span>
              <span className="font-medium text-sm">{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-16 relative overflow-hidden">
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px)] bg-[linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
          {/* Radial Gradient Flare */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-[#00FF66]/5 via-transparent to-transparent rounded-full blur-3xl" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#00FF66] via-green-300 to-[#00FF66] bg-clip-text text-transparent">
                {t('hero.title') || '2026 FIFA World Cup AI Predictions'}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description') || 'Real-time AI-powered predictions, match analysis, and expert insights for the biggest tournament in football history.'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/football"
                className="group relative px-10 py-5 bg-[#00FF66] text-black font-bold rounded-xl text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,102,0.6)]"
              >
                <span className="relative z-10">
                  {t('hero.cta') || 'Enter the Arena'}
                </span>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </div>
          </div>
        </section>

        {/* AI Experts Section */}
        {MODULES.worldCup2026.enabled && (
          <AIExpertsSection
            expertStats={statsMap}
            championExpert={championExpert}
            demotedExperts={demotedExperts}
            expertRanking={expertRanking}
          />
        )}
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}