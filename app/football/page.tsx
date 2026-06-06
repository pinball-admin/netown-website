'use client'

import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import ComplianceNotice from '@/components/football/ComplianceNotice'
import HeroSection from '@/components/football/HeroSection'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import MainContentPanel from '@/components/football/MainContentPanel'
import RightSidebar from '@/components/football/RightSidebar'
import FootballTopBar from '@/components/football/FootballTopBar'
import MobileBottomNav from '@/components/football/MobileBottomNav'
import AdSenseAd from '@/components/football/AdSenseAd'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ui/ScrollToTop'
import PageTransition from '@/components/ui/PageTransition'
import CountdownBanner from '@/components/football/CountdownBanner'
import DailyQuizCard from '@/components/football/DailyQuizCard'
import LiveScoreBoard from '@/components/football/LiveScoreBoard'

export default function FootballPage() {
  const { t } = useI18n()
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-50 overflow-x-hidden">
      {/* Compliance Notice */}
      <ComplianceNotice />

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

      <FootballTopBar />

      {/* Google AdSense - Top Banner */}
      <div className="pt-16">
        <DynamicAdBanner teamId="worldcup" teamName="World Cup 2026" teamFlag="🏆" variant="top" />
      </div>

      {/* Main Content */}
      <PageTransition>
        <main className="pt-16 pb-20 md:pb-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Match Countdown Banner */}
            <CountdownBanner />

            {/* Hero Section with Countdown */}
            <ErrorBoundary>
              <HeroSection />
            </ErrorBoundary>

            {/* Welcome Message */}
            <div className="mb-8 text-center">
              <div className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-slate-300 text-xs sm:text-sm">
                  Welcome to the ultimate 2026 World Cup AI prediction platform! 
                  <span className="text-emerald-400 font-medium ml-2">
                    {user ? `Logged in as ${user.name}` : 'Login to participate in predictions!'}
                  </span>
                </p>
              </div>
            </div>

            {/* Daily Quiz Card */}
            <ErrorBoundary>
              <DailyQuizCard />
            </ErrorBoundary>

            {/* Live Scores */}
            <ErrorBoundary>
              <LiveScoreBoard />
            </ErrorBoundary>

            {/* 70% Main Content + 30% Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              {/* Main Content (70%) */}
              <div className="lg:col-span-7">
                <ErrorBoundary>
                  <MainContentPanel />
                </ErrorBoundary>
              </div>

              {/* Right Sidebar (30%) */}
              <div className="lg:col-span-3">
                <ErrorBoundary>
                  <RightSidebar />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </main>
      </PageTransition>

      {/* Google AdSense - Bottom Banner Ad */}
      <AdSenseAd adSlot="1234567890" adFormat="horizontal" className="mt-6" />

      <MobileBottomNav />
      <ScrollToTop />

    </div>
  )
}