'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import AIModelPanel from '@/components/football/AIModelPanel'
import MatchPredictionCard from '@/components/football/MatchPredictionCard'
import PersonaExpertsPanel from '@/components/football/PersonaExpertsPanel'
import PostCreator from '@/components/football/PostCreator'
import PostFeed from '@/components/football/PostFeed'
import TeamsHub from '@/components/football/TeamsHub'
import TeamMatrix from '@/components/football/TeamMatrix'
import AmazonBanner from '@/components/football/AmazonBanner'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import AdSenseAd from '@/components/football/AdSenseAd'

// Match Data
const matchData = {
  'Group A': [
    { id: 1, team1: 'MEX', team2: 'KOR', date: '2026-06-11', time: '16:00' },
    { id: 2, team1: 'CZE', team2: 'RSA', date: '2026-06-11', time: '18:00' },
    { id: 3, team1: 'MEX', team2: 'CZE', date: '2026-06-16', time: '18:00' },
    { id: 4, team1: 'KOR', team2: 'RSA', date: '2026-06-17', time: '15:00' },
  ],
  'Group B': [
    { id: 5, team1: 'CAN', team2: 'BIH', date: '2026-06-12', time: '18:00' },
    { id: 6, team1: 'QAT', team2: 'SUI', date: '2026-06-12', time: '21:00' },
    { id: 7, team1: 'CAN', team2: 'QAT', date: '2026-06-17', time: '18:00' },
    { id: 8, team1: 'BIH', team2: 'SUI', date: '2026-06-18', time: '15:00' },
  ],
  'Group C': [
    { id: 9, team1: 'BRA', team2: 'MAR', date: '2026-06-13', time: '20:00' },
    { id: 10, team1: 'HAI', team2: 'SCO', date: '2026-06-13', time: '18:00' },
    { id: 11, team1: 'BRA', team2: 'HAI', date: '2026-06-18', time: '18:00' },
    { id: 12, team1: 'MAR', team2: 'SCO', date: '2026-06-19', time: '15:00' },
  ],
  'Knockouts': [
    { id: 13, team1: 'Group A Winner', team2: 'Group B Runner-up', date: '2026-06-28', time: '16:00', round: 'Round of 16' },
    { id: 14, team1: 'Group C Winner', team2: 'Group D Runner-up', date: '2026-06-28', time: '19:00', round: 'Round of 16' },
    { id: 15, team1: 'Group E Winner', team2: 'Group F Runner-up', date: '2026-06-28', time: '21:00', round: 'Round of 16' },
  ],
}

export default function MainContentPanel() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('Group A')
  const [feedRefreshKey, setFeedRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      {/* Multi-Model AI Prediction Hub */}
      <AIModelPanel />

      {/* 🔥 AI Smart Predictions - Real Match Data */}
      <MatchPredictionCard />

      {/* Ad - Between Predictions and Experts (high engagement zone) */}
      <DynamicAdBanner teamId="worldcup" teamName="World Cup 2026" teamFlag="🏆" variant="inline" />

      {/* 5 AI Persona Masters with live comment threads */}
      <PersonaExpertsPanel />

      {/* World Cup Schedule */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            📅 {t('schedule.fifaSchedule')}
          </h2>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1.5 text-xs bg-slate-800/50 text-slate-400 hover:text-white rounded-lg transition-colors"
              onClick={() => window.open('https://www.fifa.com/tournaments/mens/worldcup/2026/schedule', '_blank')}
            >
              {t('schedule.fifaOfficial')}
            </button>
            <button className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              {t('schedule.myTimezone')}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'Group A', label: 'Group A' },
            { key: 'Group B', label: 'Group B' },
            { key: 'Group C', label: 'Group C' },
            { key: 'Knockouts', label: 'Knockouts' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Match List */}
        <div className="space-y-4">
          {matchData[activeTab as keyof typeof matchData]?.map((match) => (
            <div key={match.id} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:border-emerald-500/30">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-2 border border-slate-600">
                      <span className="text-xs font-bold text-white">{match.team1}</span>
                    </div>
                    <span className="text-sm font-medium text-white text-center max-w-[80px] truncate">{match.team1}</span>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center">
                    <div className="text-slate-500 font-bold text-xl px-4">vs</div>
                    <div className="text-slate-400 text-xs mt-1">{t('schedule.fifa2026')}</div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-2 border border-slate-600">
                      <span className="text-xs font-bold text-white">{match.team2}</span>
                    </div>
                    <span className="text-sm font-medium text-white text-center max-w-[80px] truncate">{match.team2}</span>
                  </div>
                </div>

                {/* Time and Details */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-slate-400 text-xs text-right">
                    <div className="text-white font-medium">{match.date}</div>
                    <div>{match.time} UTC-7</div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/football/schedule/match/${match.id}`}
                      className="px-3 py-1.5 text-xs bg-slate-800/60 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                    >
                      {t('schedule.details')}
                    </Link>
                    <Link
                      href={`/football/predictions/${match.id}`}
                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300"
                    >
                      {t('schedule.predict')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Schedule Link */}
        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <Link
            href="/football/schedule"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-500/30 transition-all duration-300"
          >
            <span>{t('schedule.viewFull')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* AdSense - Below Schedule */}
      <AdSenseAd adSlot="" adFormat="horizontal" className="my-4" />

      {/* Amazon Banner */}
      <AmazonBanner />

      {/* 48-Team Global Gateway */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            🌍 {t('home.globalGateway')}
          </h2>
          <div className="text-slate-400 text-sm">
            {t('home.groupsDesc')}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            {t('home.expansionText')}

          </p>
        </div>

        <TeamMatrix />

        <div className="mt-6">
          <TeamsHub />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
              <div className="text-emerald-400 text-lg font-bold mb-2">{t('home.tournamentFormat')}</div>
              <div className="text-slate-300 text-sm">
                {t('home.formatDesc')}
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
              <div className="text-cyan-400 text-lg font-bold mb-2">{t('home.hostCities')}</div>
              <div className="text-slate-300 text-sm">
                {t('home.hostCitiesDesc')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Community hub (incremental) */}
      <div className="space-y-4">
        <PostCreator onSuccess={() => setFeedRefreshKey((k) => k + 1)} />
        <PostFeed key={feedRefreshKey} />
        <div className="text-center">
          <Link
            href="/football/forum"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-xl text-orange-400 text-sm font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all"
          >
            {t('forum.openForum')}
          </Link>
        </div>
      </div>
      {/* AdSense - Below Community */}
      <AdSenseAd adSlot="" adFormat="auto" className="mt-4" />
    </div>
  )
}