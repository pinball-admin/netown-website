import { Metadata } from 'next'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import TeamNav from '@/components/football/TeamNav'
import Translate from '@/components/football/Translate'
import { TeamJsonLd } from '@/components/JsonLd'
import { teamsData, TeamData } from '@/libs/data/teams-data'

interface PageProps {
  params: { id: string }
}

const defaultTeam = (id: string): TeamData => ({
  name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  flag: '🏆',
  code: id.substring(0, 3).toUpperCase(),
  ranking: 999,
  coach: 'TBD',
  coachNationality: 'TBD',
  keyPlayers: [],
  squad: [],
  worldCupTitles: 0,
  bestResult: 'TBD',
  group: 'TBD',
  fixtures: [],
  aiAnalysis: [
    { persona: 'zidane_gao', alias: 'Zidane Gao', initials: 'ZG', gradient: 'from-amber-500 to-orange-600', winProbability: 5, analysis: 'Team data coming soon. Stay tuned for full squad and analysis.' },
  ],
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const team = teamsData[params.id] || defaultTeam(params.id)

  return {
    title: `${team.name} - World Cup 2026 Squad & AI Predictions | Netown`,
    description: `Discover ${team.name}'s complete World Cup 2026 squad, AI win probability analysis, match fixtures, and expert predictions. ${team.name} ranks #${team.ranking} in FIFA standings.`,
    openGraph: {
      title: `${team.name} | World Cup 2026`,
      description: `Squad list, AI predictions, and match schedule for ${team.name} at World Cup 2026.`,
    },
  }
}

export default function TeamPage({ params }: PageProps) {
  const team = teamsData[params.id] || defaultTeam(params.id)

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      {/* Navigation */}
      <TeamNav />

      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top Ad Banner */}
          <div className="mb-6">
            <DynamicAdBanner teamId={params.id} teamName={team.name} teamFlag={team.flag} />
          </div>

          {/* Team Header */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-[100px] rounded-full" />
            <div className="relative bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="text-8xl">{team.flag}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {team.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      FIFA #{team.ranking}
                    </span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                      {team.worldCupTitles} 🏆 <Translate text="common.titles" />
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {team.group}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Squad & Key Players */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Players */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Key Players
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {team.keyPlayers.map((player) => (
                    <div key={player.name} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center hover:border-emerald-500/30 transition-all">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl font-bold text-white">{player.number}</span>
                      </div>
                      <h3 className="text-white font-semibold">{player.name}</h3>
                      <p className="text-slate-400 text-sm">{player.position}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Squad List */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  26-Man Squad
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {team.squad.map((player) => (
                    <div key={player.name} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-500 font-bold">{player.number}</span>
                        <span className="text-white font-medium text-sm truncate">{player.name.split(' ').pop()}</span>
                      </div>
                      <p className="text-slate-500 text-xs">{player.position}</p>
                      <p className="text-slate-600 text-xs truncate">{player.club}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixtures */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Match Fixtures
                </h2>
                <div className="space-y-3">
                  {team.fixtures.map((fixture, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-slate-400 text-sm font-medium w-20">{fixture.date}</div>
                        <div className="text-white font-semibold">vs {fixture.opponent}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 text-sm">{fixture.time}</div>
                        <div className="text-slate-500 text-xs">{fixture.venue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="space-y-6">
              {/* Coach */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
                  Head Coach
                </h2>
                <div className="bg-slate-800/40 rounded-xl p-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">👔</span>
                  </div>
                  <h3 className="text-white font-semibold">{team.coach}</h3>
                  <p className="text-slate-400 text-sm">{team.coachNationality}</p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                  AI Win Probability
                </h2>
                <div className="space-y-4">
                  {team.aiAnalysis.map((ai) => (
                    <div key={ai.persona} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ai.gradient} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">{ai.initials}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">{ai.alias}</h3>
                          <p className="text-emerald-400 font-bold">{ai.winProbability}% chance</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">{ai.analysis}</p>
                    </div>
                  ))}
                </div>

                {/* Overall Probability */}
                <div className="mt-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium"><Translate text="common.overallAiConsensus" /></span>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {Math.round(team.aiAnalysis.reduce((sum, ai) => sum + ai.winProbability, 0) / team.aiAnalysis.length)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
                  <Translate text="team.worldCupHistory" />
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400"><Translate text="common.bestResult" /></span>
                    <span className="text-white font-medium">{team.bestResult}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400"><Translate text="common.titles" /></span>
                    <span className="text-amber-400 font-bold">{team.worldCupTitles} 🏆</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ad Banner */}
          <div className="mt-8">
            <DynamicAdBanner teamId={params.id} teamName={team.name} teamFlag={team.flag} />
          </div>
        </div>
      </main>

      <TeamJsonLd
        name={`${team.name} National Football Team`}
        description={`Complete profile of ${team.name} for World Cup 2026. View squad, stats, fixtures, and AI predictions. FIFA ranking #${team.ranking}.`}
        url={`https://football.netown.cn/football/teams/${params.id}`}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs font-medium">2026 Netown · football.netown.cn · AI Prediction Engine</p>
        </div>
      </footer>
    </div>
  )
}
