'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { Language, languages as languageOptions } from '@/contexts/I18nContext'
import { useCompliance } from '@/contexts/ComplianceContext'
import { useUser } from '@/contexts/UserContext'
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
  const { user, isLoggedIn, login, logout } = useUser()
  const { expertStats, championExpert, demotedExperts, expertRanking } = usePrediction()

  const isChinese = language === 'zh'
  const brandName = t('brand.name') || 'Netown'
  const brandSlogan = t('brand.slogan') || 'Stick together, kick together.'

  const statsMap: Record<ExpertId, ExpertStats> = {} as Record<ExpertId, ExpertStats>
  Object.entries(expertStats).forEach(([key, value]) => {
    statsMap[key as ExpertId] = value as ExpertStats
  })

  const handleLogin = (userData: any) => {
    login(userData)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-16">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px)] bg-[linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[#00FF66]/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-screen py-12 sm:py-20">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-full mb-6 sm:mb-8">
                <span className="text-[#00FF66] text-sm font-medium">🏆 FIFA World Cup 2026</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                {brandName}
              </h1>
              
              <p className="text-[#00FF66] text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-6 sm:mb-8">
                {brandSlogan}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/football"
                  className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 rounded-xl bg-[#00FF66]/10 border-2 border-[#00FF66] text-[#00FF66] font-bold text-base sm:text-lg hover:bg-[#00FF66] hover:text-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#00FF66]/30"
                >
                  <span className="relative z-10">Enter the Arena</span>
                </Link>
                
                {!isLoggedIn && (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 rounded-xl bg-slate-800 border-2 border-slate-600 text-white font-bold text-base sm:text-lg hover:bg-slate-700 transition-all duration-300"
                  >
                    <span className="relative z-10">Login / Register</span>
                  </button>
                )}
              </div>
              
              {isLoggedIn && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <CandyBalance userId={user!.id} />
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="w-full mt-8 sm:mt-12">
              <AIExpertsSection
                expertStats={statsMap}
                championExpert={championExpert}
                demotedExperts={demotedExperts}
                expertRanking={expertRanking}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {isLoggedIn && <CandyBalance userId={user!.id} />}
        
        <div className="relative">
          <button
            onClick={() => {
              const currentIndex = languageOptions.findIndex(l => l.code === language)
              const nextIndex = (currentIndex + 1) % languageOptions.length
              setLanguage(languageOptions[nextIndex].code)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md border border-[#00FF66]/30 rounded-xl text-slate-300 hover:border-[#00FF66] hover:text-[#00FF66] transition-all duration-200"
          >
            <span className="text-lg">{languageFlags[language]}</span>
            <span className="font-medium">{language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {MODULES.worldCup2026.enabled && (
        <div className="fixed bottom-20 left-6 z-50 text-slate-500 text-xs">
          2026 FIFA World Cup AI Prediction Platform
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}
