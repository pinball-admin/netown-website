import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { worldCupHistory, getTournamentYears } from '@/libs/data/worldcup-history'
import { teamsData } from '@/libs/data/teams-data'
import { TournamentJsonLd } from '@/components/football/TournamentJsonLd'

interface PageProps {
  params: { year: string }
}

export async function generateStaticParams() {
  return getTournamentYears().map(year => ({ year: String(year) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const year = parseInt(params.year)
  const t = worldCupHistory[year]
  if (!t) return { title: 'Not Found' }

  return {
    title: `${year} FIFA World Cup - ${t.champion} Champion, History & Stats | Netown`,
    description: `Complete guide to the ${year} FIFA World Cup in ${t.host.join(' & ')}. ${t.champion} defeated ${t.runnerUp} ${t.finalScore} in the final. ${t.topScorer} top scorer with ${t.topScorerGoals} goals. View full tournament stats, participating teams, and legendary moments.`,
    keywords: [
      `${year} World Cup`, `${t.host[0]} ${year}`, `World Cup ${year}`,
      `${t.champion} ${year}`, `${t.champion} World Cup`,
      'FIFA World Cup', 'football history', 'World Cup results',
      ...t.participatingTeams.slice(0, 8).map(p => p.name),
    ],
    openGraph: {
      title: `${year} FIFA World Cup - ${t.champion} Champion`,
      description: `${t.champion} defeated ${t.runnerUp} ${t.finalScore} in the final. ${t.topScorer} scored ${t.topScorerGoals} goals.`,
      type: 'website',
    },
  }
}

export default function TournamentDetailPage({ params }: PageProps) {
  const year = parseInt(params.year)
  const t = worldCupHistory[year]
  if (!t) notFound()

  const years = getTournamentYears()
  const currentIdx = years.indexOf(year)
  const prevYear = currentIdx > 0 ? years[currentIdx - 1] : null
  const nextYear = currentIdx < years.length - 1 ? years[currentIdx + 1] : null

  const hostString = t.host.join(' & ')
  const baseUrl = 'https://football.netown.cn'

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      <TournamentJsonLd
        year={year}
        champion={t.champion}
        runnerUp={t.runnerUp}
        description={`${year} FIFA World Cup hosted by ${hostString}. Champion: ${t.champion}, Runner-up: ${t.runnerUp}.`}
        url={`${baseUrl}/football/history/${year}`}
        startDate={`${year}-06-01`}
        endDate={`${year === 2022 ? '12-18' : '07-30'}`}
        hostCountries={t.host}
      />

      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900/80 to-[#030712] border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/football/history" className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm transition-colors">
            ← Back to History
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {year}
            </span>
            <div className="flex gap-2">
              {t.hostFlags.map((flag, i) => (
                <span key={i} className="text-3xl">{flag}</span>
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{year} FIFA World Cup</h1>
          <p className="text-slate-400">Hosted by {hostString}</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Final Match Card */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-bold text-amber-400 mb-6 text-center">Final Match</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-5xl mb-2">{t.hostFlags[t.host.length > 1 && t.championCode === t.host[0] ? 0 : 0]}</div>
              <div className="text-white font-bold text-lg">{t.champion}</div>
              <div className="text-amber-400 text-sm font-medium">Champion</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">{t.finalScore}</div>
              <div className="text-slate-500 text-xs">{t.finalDate}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">🏴</div>
              <div className="text-white font-bold text-lg">{t.runnerUp}</div>
              <div className="text-slate-500 text-sm font-medium">Runner-up</div>
            </div>
          </div>
          <div className="text-center mt-4 text-slate-500 text-xs">{t.finalVenue}</div>
        </div>

        {/* Summary */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <p className="text-slate-300 leading-relaxed">{t.summary}</p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatBox label="Total Teams" value={String(t.totalTeams)} />
          <StatBox label="Matches" value={String(t.matchesPlayed)} />
          <StatBox label="Total Goals" value={String(t.totalGoals)} />
          <StatBox label="Attendance" value={formatAttendance(t.attendance)} />
          <StatBox label="Top Scorer" value={t.topScorer} sub={`${t.topScorerGoals} goals`} />
          <StatBox label="Best Player" value={t.bestPlayer} />
        </div>

        {/* Podium */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Final Standings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <PodiumItem position="1st" team={t.champion} code={t.championCode} medal="🥇" />
            <PodiumItem position="2nd" team={t.runnerUp} code={t.runnerUpCode} medal="🥈" />
            <PodiumItem position="3rd" team={t.thirdPlace} code={t.thirdPlaceCode} medal="🥉" />
            <PodiumItem position="4th" team={t.fourthPlace} code={t.fourthPlaceCode} />
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Fun Facts</h2>
          <ul className="space-y-3">
            {t.funFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notable Moments */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Notable Moments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.notableMoments.map((moment, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg mt-0.5">⚡</span>
                  <p className="text-slate-300 text-sm">{moment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participating Teams */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Participating Teams</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {t.participatingTeams.map((team) => {
              const in2026 = teamsData[team.code.toLowerCase()] && team.code !== 'URS' && team.code !== 'YUG' && team.code !== 'GDR' && team.code !== 'TCH'
              return in2026 ? (
                <Link
                  key={team.code}
                  href={`/football/teams/${team.code.toLowerCase()}`}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">{team.name}</div>
                  <div className="text-slate-500 text-xs">{team.bestFinish}</div>
                </Link>
              ) : (
                <div key={team.code} className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-3 opacity-70">
                  <div className="text-slate-400 font-medium text-sm">{team.name}</div>
                  <div className="text-slate-600 text-xs">{team.bestFinish}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center py-6 border-t border-slate-800/50">
          {prevYear ? (
            <Link href={`/football/history/${prevYear}`} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm">
              ← {prevYear} World Cup
            </Link>
          ) : <div />}
          {nextYear ? (
            <Link href={`/football/history/${nextYear}`} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm">
              {nextYear} World Cup →
            </Link>
          ) : <div />}
        </div>
      </main>

      <footer className="border-t border-slate-800/50 py-5 mt-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs font-medium">2026 Netown · football.netown.cn · AI Prediction Engine</p>
        </div>
      </footer>
    </div>
  )
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-amber-400 text-xs mt-1">{sub}</div>}
    </div>
  )
}

function PodiumItem({ position, team, code, medal }: { position: string; team: string; code: string; medal?: string }) {
  const in2026 = teamsData[code.toLowerCase()] && code !== 'URS' && code !== 'YUG' && code !== 'GDR'
  const content = (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center ${in2026 ? 'hover:border-emerald-500/30 transition-all' : ''}`}>
      {medal && <div className="text-2xl mb-1">{medal}</div>}
      <div className="text-xs text-slate-500 mb-1">{position}</div>
      <div className="text-white font-semibold text-sm">{team}</div>
    </div>
  )

  if (in2026) {
    return <Link href={`/football/teams/${code.toLowerCase()}`}>{content}</Link>
  }
  return content
}

function formatAttendance(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return String(num)
}
