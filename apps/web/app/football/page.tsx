'use client'

import { useState } from 'react'
import Link from 'next/link'
import PredictionModal from '@/components/football/PredictionModal'
import CandyPoints from '@/components/football/CandyPoints'
import ComplianceNotice from '@/components/football/ComplianceNotice'
import FansShop from '@/components/football/FansShop'
import TeamsHub from '@/components/football/TeamsHub'
import TeamMatrix from '@/components/football/TeamMatrix'
import GlobalOracle from '@/components/football/GlobalOracle'
import LanguageSwitcher from '@/components/football/LanguageSwitcher'
import AmazonBanner from '@/components/football/AmazonBanner'
import GamersCorner from '@/components/football/GamersCorner'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import ConnectWalletButton from '@/components/football/ConnectWalletButton'
import HeroSection from '@/components/football/HeroSection'
import { useI18n } from '@/contexts/I18nContext'

// Match Data
const matchData = {
  'Group A': [
    { id: 1, team1: 'USA', team2: 'MAR', date: '2026-06-11', time: '20:00' },
    { id: 2, team1: 'CRO', team2: 'NGA', date: '2026-06-12', time: '18:00' },
    { id: 3, team1: 'USA', team2: 'CRO', date: '2026-06-16', time: '21:00' },
    { id: 4, team1: 'MAR', team2: 'NGA', date: '2026-06-16', time: '18:00' },
  ],
  'Group B': [
    { id: 5, team1: 'ARG', team2: 'KSA', date: '2026-06-12', time: '15:00' },
    { id: 6, team1: 'MEX', team2: 'POL', date: '2026-06-12', time: '20:00' },
    { id: 7, team1: 'ARG', team2: 'MEX', date: '2026-06-17', time: '21:00' },
    { id: 8, team1: 'KSA', team2: 'POL', date: '2026-06-17', time: '18:00' },
  ],
  'Group C': [
    { id: 9, team1: 'FRA', team2: 'AUS', date: '2026-06-13', time: '15:00' },
    { id: 10, team1: 'GER', team2: 'JPN', date: '2026-06-13', time: '20:00' },
    { id: 11, team1: 'FRA', team2: 'GER', date: '2026-06-18', time: '21:00' },
    { id: 12, team1: 'AUS', team2: 'JPN', date: '2026-06-18', time: '18:00' },
  ],
  'Knockouts': [
    { id: 13, team1: 'Group A Winner', team2: 'Group B Runner-up', date: '2026-06-22', time: '21:00', round: 'Round of 16' },
    { id: 14, team1: 'Group B Winner', team2: 'Group A Runner-up', date: '2026-06-23', time: '21:00', round: 'Round of 16' },
    { id: 15, team1: 'Group C Winner', team2: 'Group D Runner-up', date: '2026-06-24', time: '21:00', round: 'Round of 16' },
  ],
}

// Predictions Mock Data
const predictions: Record<string, Record<string, { winner: string; score: string; confidence: number; analysis: string }>> = {
  'beckham_chen': {
    '1': { winner: 'USA', score: '2-1', confidence: 67, analysis: 'Bayesian model predicts USA will win with superior wing attack efficiency and precise crosses.' },
    '2': { winner: 'Croatia', score: '1-0', confidence: 58, analysis: 'Croatia experience and midfield control will suppress opponents for a narrow victory.' },
  },
  'zidane_gao': {
    '1': { winner: 'Morocco', score: '1-1', confidence: 52, analysis: 'Neural network simulation shows a tight match - draw is most likely.' },
    '2': { winner: 'Nigeria', score: '2-2', confidence: 48, analysis: 'Mystical calculation suggests a goal-fest with both teams having chances.' },
  },
  'batistuta_zhang': {
    '1': { winner: 'USA', score: '3-1', confidence: 72, analysis: 'Violent aesthetics prediction: USA offense will fire on all cylinders for a big win.' },
    '2': { winner: 'Croatia', score: '2-1', confidence: 61, analysis: 'xG model shows Croatia has higher shot conversion rate.' },
  },
  'shearer_zhang': {
    '1': { winner: 'Morocco', score: '1-0', confidence: 55, analysis: 'Traditional striker view: Morocco defense is solid, set pieces could be key.' },
    '2': { winner: 'Croatia', score: '1-0', confidence: 59, analysis: 'Physical battle advantage - Croatia wins with experience.' },
  },
  'ronaldo_silva': {
    '1': { winner: 'Morocco', score: '2-1', confidence: 63, analysis: 'Samba style prediction: Morocco counter-attack speed will trouble USA.' },
    '2': { winner: 'Nigeria', score: '2-0', confidence: 57, analysis: 'African team explosiveness not to be underestimated - dark horse potential.' },
  },
}

export default function FootballPage() {
  const { t, tTeam } = useI18n()
  const [selectedPersona, setSelectedPersona] = useState<string | null>('beckham_chen')
  const [activeTab, setActiveTab] = useState('Group A')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMatch, setModalMatch] = useState<{ id: number; team1: string; team2: string; date: string; time: string } | null>(null)
  const [isOracleOpen, setIsOracleOpen] = useState(false)

  const personaIds = ['beckham_chen', 'zidane_gao', 'batistuta_zhang', 'shearer_zhang', 'ronaldo_silva']
  const personas = personaIds.map((id) => ({
    id,
    initials: id.split('_').map(n => n[0].toUpperCase()).join(''),
    gradient: {
      beckham_chen: 'from-blue-500 to-purple-600',
      zidane_gao: 'from-amber-500 to-orange-600',
      batistuta_zhang: 'from-red-500 to-rose-600',
      shearer_zhang: 'from-green-500 to-emerald-600',
      ronaldo_silva: 'from-yellow-500 to-amber-600',
    }[id] as string,
    name: t(`aiExperts.${id}.name`),
    alias: t(`aiExperts.${id}.name`),
    preferences: t(`aiExperts.${id}.preferences`).split(','),
    traits: t(`aiExperts.${id}.traits`).split(','),
  }))

  const handlePredict = (match: { id: number; team1: string; team2: string; date: string; time: string }) => {
    if (selectedPersona) {
      setModalMatch(match)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalMatch(null)
  }

  const selectedPersonaData = personas.find(p => p.id === selectedPersona)
  const modalPrediction = modalMatch && selectedPersona
    ? predictions[selectedPersona]?.[modalMatch.id.toString()]
    : null

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-50 overflow-x-hidden">
      {/* Compliance Notice */}
      <ComplianceNotice />

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t('nav.backToTown')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <ConnectWalletButton />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Google AdSense - Top Banner */}
      <div className="pt-16">
        <DynamicAdBanner teamId="worldcup" teamName="World Cup 2026" teamFlag="🏆" variant="top" />
      </div>

      {/* Main Content */}
      <main className="pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section with Countdown */}
          <HeroSection />

          {/* Page Header */}
          <div className="mb-8" id="schedule">
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6">
            {/* Left Column - AI Personas */}
            <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                {t('aiPersonas.title')}
              </h2>
              <div className="space-y-4">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedPersona === persona.id
                        ? 'bg-slate-800/60 border-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-emerald-500/30 hover:-translate-y-0.5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${persona.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <span className="text-white font-bold text-lg">{persona.initials}</span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">{persona.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{persona.alias}</p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {persona.preferences.map((pref, idx) => (
                            <span
                              key={`pref-${idx}`}
                              className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                            >
                              {pref}
                            </span>
                          ))}
                          {persona.traits.map((trait, idx) => (
                            <span
                              key={`trait-${idx}`}
                              className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column - Schedule Sandbox */}
            <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                {t('schedule.title')}
              </h2>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'Group A', label: t('schedule.groupA') },
                  { key: 'Group B', label: t('schedule.groupB') },
                  { key: 'Group C', label: t('schedule.groupC') },
                  { key: 'Knockouts', label: t('schedule.knockouts') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key)
                      closeModal()
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Match List */}
              <div className="space-y-4">
                {matchData[activeTab as keyof typeof matchData]?.map((match) => (
                  <div
                    key={match.id}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 transition-all duration-300 hover:border-emerald-500/30"
                  >
                    {/* Match Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Team 1 */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center mb-2">
                            <span className="text-xs font-bold text-slate-300">{t(`teams.${match.team1}`)}</span>
                          </div>
                          <span className="text-sm font-medium text-white text-center max-w-[80px] truncate">{t(`teams.${match.team1}`)}</span>
                        </div>

                        {/* VS */}
                        <div className="text-slate-500 font-bold text-xl px-4">{t('schedule.vs')}</div>

                        {/* Team 2 */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center mb-2">
                            <span className="text-xs font-bold text-slate-300">{t(`teams.${match.team2}`)}</span>
                          </div>
                          <span className="text-sm font-medium text-white text-center max-w-[80px] truncate">{t(`teams.${match.team2}`)}</span>
                        </div>
                      </div>

                      {/* Time and Predict Button */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-slate-400 text-xs text-right">
                          <div>{match.date}</div>
                          <div>{match.time}</div>
                        </div>
                        <button
                          onClick={() => handlePredict(match)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          {t('schedule.aiPredict')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Full Schedule Link */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <Link
                  href="/football/schedule"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <span>{t('schedule.viewFullSchedule')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Amazon Banner */}
              <AmazonBanner />

              {/* Teams Hub */}
              <TeamsHub />

              {/* 48-Team Global Gateway */}
              <TeamMatrix />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candy Points */}
              <CandyPoints />

              {/* Fans Shop */}
              <FansShop />

              {/* Gamers Corner */}
              <GamersCorner />

              {/* Quick Links */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  {t('quickLinks.title')}
                </h2>
                <div className="space-y-3">
                  <div className="h-12 bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-center justify-center hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                    <span className="text-slate-400 text-sm font-medium">{t('quickLinks.predictions')}</span>
                  </div>
                  <div className="h-12 bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-center justify-center hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                    <span className="text-slate-400 text-sm font-medium">{t('quickLinks.territories')}</span>
                  </div>
                  <div className="h-12 bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 flex items-center justify-center hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                    <span className="text-slate-400 text-sm font-medium">{t('quickLinks.forum')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Prediction Modal */}
      <PredictionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        match={modalMatch}
        persona={selectedPersonaData || null}
        prediction={modalPrediction}
      />

      {/* Global Oracle Modal */}
      <GlobalOracle
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
      />

      {/* Google AdSense - Bottom Banner (hidden on main dashboard) */}
      <DynamicAdBanner
        teamId="worldcup-bottom"
        teamName="World Cup 2026"
        teamFlag="🏆"
        variant="bottom"
        isScrollTriggered={true}
        showOnMainDashboard={false}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs font-medium">{t('brand.name')} · football.netown.cn · {t('home.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}
