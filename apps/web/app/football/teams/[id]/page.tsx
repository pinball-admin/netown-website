import { Metadata } from 'next'
import Link from 'next/link'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'

interface PageProps {
  params: { id: string }
}

interface TeamData {
  name: string
  flag: string
  code: string
  ranking: number
  coach: string
  coachNationality: string
  keyPlayers: { name: string; number: number; position: string }[]
  squad: { name: string; number: number; position: string; club: string }[]
  worldCupTitles: number
  bestResult: string
  group: string
  fixtures: { opponent: string; date: string; time: string; venue: string }[]
  aiAnalysis: { persona: string; alias: string; initials: string; gradient: string; winProbability: number; analysis: string }[]
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

const teamsData: Record<string, {
  name: string
  flag: string
  code: string
  ranking: number
  coach: string
  coachNationality: string
  keyPlayers: { name: string; number: number; position: string }[]
  squad: { name: string; number: number; position: string; club: string }[]
  worldCupTitles: number
  bestResult: string
  group: string
  fixtures: { opponent: string; date: string; time: string; venue: string }[]
  aiAnalysis: { persona: string; alias: string; initials: string; gradient: string; winProbability: number; analysis: string }[]
}> = {
  'argentina': {
    name: 'Argentina',
    flag: '🇦🇷',
    code: 'ARG',
    ranking: 1,
    coach: 'Lionel Scaloni',
    coachNationality: 'Argentine',
    keyPlayers: [
      { name: 'Lionel Messi', number: 10, position: 'Forward' },
      { name: 'Angel Di Maria', number: 11, position: 'Winger' },
      { name: 'Emiliano Martinez', number: 23, position: 'Goalkeeper' },
    ],
    squad: [
      { name: 'Lionel Messi', number: 10, position: 'Forward', club: 'Inter Miami' },
      { name: 'Angel Di Maria', number: 11, position: 'Winger', club: 'Benfica' },
      { name: 'Emiliano Martinez', number: 23, position: 'Goalkeeper', club: 'Aston Villa' },
      { name: 'Cristian Romero', number: 13, position: 'Defender', club: 'Tottenham' },
      { name: 'Nicolas Otamendi', number: 19, position: 'Defender', club: 'Benfica' },
      { name: 'Leandro Paredes', number: 5, position: 'Midfielder', club: 'Juventus' },
      { name: 'Rodrigo De Paul', number: 7, position: 'Midfielder', club: 'Atletico Madrid' },
      { name: 'Julian Alvarez', number: 9, position: 'Forward', club: 'Manchester City' },
    ],
    worldCupTitles: 3,
    bestResult: 'Champion (1978, 1986, 2022)',
    group: 'Group C',
    fixtures: [
      { opponent: 'Saudi Arabia', date: '2026-06-12', time: '15:00', venue: 'MetLife Stadium, NY' },
      { opponent: 'Mexico', date: '2026-06-17', time: '21:00', venue: 'SoFi Stadium, LA' },
    ],
    aiAnalysis: [
      { persona: 'zidane_gao', alias: 'Zidane Gao', initials: 'ZG', gradient: 'from-amber-500 to-orange-600', winProbability: 18, analysis: 'Neural network shows 18% defense retention probability. Messis final dance could end in glory.' },
      { persona: 'beckham_chen', alias: 'Beckham Chen', initials: 'BC', gradient: 'from-blue-500 to-purple-600', winProbability: 22, analysis: 'Bayesian model favors Argentina. Wing attack efficiency combined with squad depth is unmatched.' },
      { persona: 'batistuta_zhang', alias: 'Batistuta Zhang', initials: 'BZ', gradient: 'from-red-500 to-rose-600', winProbability: 20, analysis: 'Violent aesthetics index high. Aggressive pressing game suits this squad perfectly.' },
    ],
  },
  'brazil': {
    name: 'Brazil',
    flag: '🇧🇷',
    code: 'BRA',
    ranking: 3,
    coach: 'Dorival Jr.',
    coachNationality: 'Brazilian',
    keyPlayers: [
      { name: 'Neymar Jr.', number: 10, position: 'Forward' },
      { name: 'Vinicius Jr.', number: 7, position: 'Winger' },
      { name: 'Rodri', number: 5, position: 'Midfielder' },
    ],
    squad: [
      { name: 'Neymar Jr.', number: 10, position: 'Forward', club: 'Al-Hilal' },
      { name: 'Vinicius Jr.', number: 7, position: 'Winger', club: 'Real Madrid' },
      { name: 'Rodri', number: 5, position: 'Midfielder', club: 'Manchester City' },
      { name: 'Alisson Becker', number: 1, position: 'Goalkeeper', club: 'Liverpool' },
      { name: 'Marquinhos', number: 4, position: 'Defender', club: 'PSG' },
    ],
    worldCupTitles: 5,
    bestResult: 'Champion (1958, 1962, 1970, 1994, 2002)',
    group: 'Group G',
    fixtures: [
      { opponent: 'Serbia', date: '2026-06-14', time: '18:00', venue: 'Rose Bowl, Pasadena' },
      { opponent: 'Switzerland', date: '2026-06-19', time: '20:00', venue: 'AT&T Stadium, Dallas' },
    ],
    aiAnalysis: [
      { persona: 'batistuta_zhang', alias: 'Batistuta Zhang', initials: 'BZ', gradient: 'from-red-500 to-rose-600', winProbability: 24, analysis: 'Highest xG shooting rate in South America. Neymar finally lifts the trophy.' },
      { persona: 'ronaldo_silva', alias: 'Ronaldo Silva', initials: 'RS', gradient: 'from-yellow-500 to-amber-600', winProbability: 21, analysis: 'Samba explosiveness peak. 1v1 success rate is devastating.' },
    ],
  },
  'france': {
    name: 'France',
    flag: '🇫🇷',
    code: 'FRA',
    ranking: 2,
    coach: 'Didier Deschamps',
    coachNationality: 'French',
    keyPlayers: [
      { name: 'Kylian Mbappe', number: 10, position: 'Forward' },
      { name: 'Antoine Griezmann', number: 7, position: 'Forward' },
      { name: 'N Golo Kante', number: 6, position: 'Midfielder' },
    ],
    squad: [
      { name: 'Kylian Mbappe', number: 10, position: 'Forward', club: 'Real Madrid' },
      { name: 'Antoine Griezmann', number: 7, position: 'Forward', club: 'Atletico Madrid' },
      { name: 'N Golo Kante', number: 6, position: 'Midfielder', club: 'Al-Ettifaq' },
      { name: 'Hugo Lloris', number: 1, position: 'Goalkeeper', club: 'Retired' },
      { name: 'William Saliba', number: 4, position: 'Defender', club: 'Arsenal' },
    ],
    worldCupTitles: 2,
    bestResult: 'Champion (1998, 2018)',
    group: 'Group D',
    fixtures: [
      { opponent: 'Australia', date: '2026-06-13', time: '15:00', venue: 'Lamar Hunt US Bank Stadium' },
      { opponent: 'Germany', date: '2026-06-18', time: '21:00', venue: 'Mercedes-Benz Stadium' },
    ],
    aiAnalysis: [
      { persona: 'beckham_chen', alias: 'Beckham Chen', initials: 'BC', gradient: 'from-blue-500 to-purple-600', winProbability: 20, analysis: 'Wing cross efficiency through Mbappe is devastating. Premier League style tactics.' },
      { persona: 'zidane_gao', alias: 'Zidane Gao', initials: 'ZG', gradient: 'from-amber-500 to-orange-600', winProbability: 19, analysis: 'Midfield control with Kante return makes them favorites for deep knockout runs.' },
    ],
  },
  'england': {
    name: 'England',
    flag: '🏴',
    code: 'ENG',
    ranking: 5,
    coach: 'Gareth Southgate',
    coachNationality: 'English',
    keyPlayers: [
      { name: 'Harry Kane', number: 9, position: 'Striker' },
      { name: 'Declan Rice', number: 6, position: 'Midfielder' },
      { name: 'Phil Foden', number: 8, position: 'Midfielder' },
    ],
    squad: [
      { name: 'Harry Kane', number: 9, position: 'Striker', club: 'Bayern Munich' },
      { name: 'Declan Rice', number: 6, position: 'Midfielder', club: 'Arsenal' },
      { name: 'Phil Foden', number: 8, position: 'Midfielder', club: 'Manchester City' },
      { name: 'Bukayo Saka', number: 7, position: 'Winger', club: 'Arsenal' },
    ],
    worldCupTitles: 1,
    bestResult: 'Champion (1966)',
    group: 'Group B',
    fixtures: [
      { opponent: 'Iran', date: '2026-06-13', time: '18:00', venue: 'Levi Stadium, Santa Clara' },
      { opponent: 'USA', date: '2026-06-20', time: '20:00', venue: 'MetLife Stadium, NY' },
    ],
    aiAnalysis: [
      { persona: 'shearer_zhang', alias: 'Shearer Zhang', initials: 'SZ', gradient: 'from-green-500 to-emerald-600', winProbability: 15, analysis: 'Penalty box domination through Kane is their key weapon. Physical battle advantage.' },
      { persona: 'beckham_chen', alias: 'Beckham Chen', initials: 'BC', gradient: 'from-blue-500 to-purple-600', winProbability: 14, analysis: 'Premier League discipline gives them edge in tight knockout matches.' },
    ],
  },
  'usa': {
    name: 'USA',
    flag: '🇺🇸',
    code: 'USA',
    ranking: 11,
    coach: 'Gregg Berhalter',
    coachNationality: 'American',
    keyPlayers: [
      { name: 'Christian Pulisic', number: 10, position: 'Winger' },
      { name: 'Gio Reyna', number: 7, position: 'Midfielder' },
      { name: 'Weston McKennie', number: 8, position: 'Midfielder' },
    ],
    squad: [
      { name: 'Christian Pulisic', number: 10, position: 'Winger', club: 'AC Milan' },
      { name: 'Gio Reyna', number: 7, position: 'Midfielder', club: 'Borussia Dortmund' },
      { name: 'Weston McKennie', number: 8, position: 'Midfielder', club: 'Juventus' },
      { name: 'Matt Turner', number: 1, position: 'Goalkeeper', club: 'Nottingham Forest' },
    ],
    worldCupTitles: 0,
    bestResult: 'Quarter-finals (2002)',
    group: 'Group A',
    fixtures: [
      { opponent: 'Morocco', date: '2026-06-11', time: '20:00', venue: 'SoFi Stadium, LA' },
      { opponent: 'Croatia', date: '2026-06-16', time: '21:00', venue: 'AT&T Stadium, Dallas' },
    ],
    aiAnalysis: [
      { persona: 'ronaldo_silva', alias: 'Ronaldo Silva', initials: 'RS', gradient: 'from-yellow-500 to-amber-600', winProbability: 12, analysis: 'Home soil advantage plus explosive 1v1 skills. Dark horse potential.' },
      { persona: 'zidane_gao', alias: 'Zidane Gao', initials: 'ZG', gradient: 'from-amber-500 to-orange-600', winProbability: 10, analysis: 'Young squad with high neural network learning potential. Could surprise.' },
    ],
  },
  'germany': {
    name: 'Germany',
    flag: '🇩🇪',
    code: 'GER',
    ranking: 16,
    coach: 'Julian Nagelsmann',
    coachNationality: 'German',
    keyPlayers: [
      { name: 'Manuel Neuer', number: 1, position: 'Goalkeeper' },
      { name: 'Toni Kroos', number: 8, position: 'Midfielder' },
      { name: 'Kai Havertz', number: 10, position: 'Forward' },
    ],
    squad: [
      { name: 'Manuel Neuer', number: 1, position: 'Goalkeeper', club: 'Bayern Munich' },
      { name: 'Toni Kroos', number: 8, position: 'Midfielder', club: 'Real Madrid' },
      { name: 'Kai Havertz', number: 10, position: 'Forward', club: 'Arsenal' },
      { name: 'Jamal Musiala', number: 14, position: 'Midfielder', club: 'Bayern Munich' },
    ],
    worldCupTitles: 4,
    bestResult: 'Champion (1954, 1974, 1990, 2014)',
    group: 'Group E',
    fixtures: [
      { opponent: 'Japan', date: '2026-06-13', time: '20:00', venue: 'Lincoln Financial Field' },
      { opponent: 'Spain', date: '2026-06-19', time: '18:00', venue: 'NRG Stadium, Houston' },
    ],
    aiAnalysis: [
      { persona: 'shearer_zhang', alias: 'Shearer Zhang', initials: 'SZ', gradient: 'from-green-500 to-emerald-600', winProbability: 16, analysis: 'Young squad under Nagelsmann tactical genius. Traditional striker system revitalized.' },
      { persona: 'batistuta_zhang', alias: 'Batistuta Zhang', initials: 'BZ', gradient: 'from-red-500 to-rose-600', winProbability: 14, analysis: 'High score game potential. German efficiency meets modern pressing.' },
    ],
  },
}

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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Link href="/football" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">{t('common.backToDashboard')}</span>
          </Link>
        </div>
      </nav>

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
                      {team.worldCupTitles} 🏆 {t('common.titles')}
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
                    <span className="text-slate-300 font-medium">{t('common.overallAiConsensus')}</span>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      {Math.round(team.aiAnalysis.reduce((sum, ai) => sum + ai.winProbability, 0) / team.aiAnalysis.length)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
                  {t('team.worldCupHistory')}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('common.bestResult')}</span>
                    <span className="text-white font-medium">{team.bestResult}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('common.titles')}</span>
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

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs font-medium">2026 Netown · football.netown.cn · AI Prediction Engine</p>
        </div>
      </footer>
    </div>
  )
}
