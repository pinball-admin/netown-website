'use client'

import ComplianceNotice from '@/components/football/ComplianceNotice'
import FootballTopBar from '@/components/football/FootballTopBar'
import TerritoryHubContent from '@/components/football/TerritoryHubContent'
import MobileBottomNav from '@/components/football/MobileBottomNav'
import PageTransition from '@/components/ui/PageTransition'

export default function TerritoriesPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen bg-[#030712] text-slate-50 overflow-x-hidden pb-16 md:pb-0">
        <ComplianceNotice />

        {/* Ambient Light Effects */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <FootballTopBar />

        <main className="pt-20 pb-8 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <TerritoryHubContent />
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </PageTransition>
  )
}
