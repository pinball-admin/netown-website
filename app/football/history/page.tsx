import { Metadata } from 'next'
import Link from 'next/link'
import { worldCupHistory, getTournamentYears } from '@/libs/data/worldcup-history'

export const metadata: Metadata = {
  title: 'Complete FIFA World Cup History 1930-2022 | Netown',
  description: 'Explore the complete history of every FIFA World Cup tournament from 1930 to 2022. Champions, runners-up, top scorers, legendary moments, and key statistics from all 22 World Cups.',
  keywords: [
    'World Cup history', 'FIFA World Cup', 'World Cup champions', 'World Cup results',
    'football history', 'soccer history', 'World Cup winners', 'World Cup 1930', 'World Cup 2022',
    'World Cup statistics', 'football tournament',
  ],
  openGraph: {
    title: 'Complete FIFA World Cup History 1930-2022',
    description: 'Every World Cup tournament, champion, and legendary moment from 1930 to 2022.',
    type: 'website',
  },
}

export default function HistoryHubPage() {
  const years = getTournamentYears()

  const decades = years.reduce<Record<string, number[]>>((acc, year) => {
    const decade = `${Math.floor(year / 10) * 10}s`
    if (!acc[decade]) acc[decade] = []
    acc[decade].push(year)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      <div className="bg-gradient-to-b from-slate-900/80 to-[#030712] border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            FIFA World Cup History
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Explore the complete history of every FIFA World Cup tournament from 1930 to 2022.
            Champions, legendary moments, top scorers, and key statistics from all 22 editions.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Decade Timeline */}
        {Object.entries(decades).reverse().map(([decade, decadeYears]) => (
          <div key={decade} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              {decade}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {decadeYears.reverse().map((year) => {
                const t = worldCupHistory[year]
                return (
                  <Link
                    key={year}
                    href={`/football/history/${year}`}
                    className="group bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-black text-white">{year}</span>
                      <div className="flex gap-1">
                        {t.hostFlags.map((flag, i) => (
                          <span key={i} className="text-2xl">{flag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{t.host.join(' & ')}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{t.hostFlags[0]}</span>
                      <span className="text-amber-400 font-bold text-sm">Champion:</span>
                      <span className="text-white font-semibold">{t.champion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">Runner-up:</span>
                      <span className="text-slate-300 text-sm">{t.runnerUp}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-600 flex gap-3">
                      <span>{t.totalTeams} teams</span>
                      <span>{t.matchesPlayed} matches</span>
                    </div>
                    <div className="mt-3 text-amber-400 text-xs font-medium group-hover:text-amber-300 transition-colors">
                      View details →
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      <footer className="border-t border-slate-800/50 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs font-medium">2026 Netown · football.netown.cn · AI Prediction Engine</p>
        </div>
      </footer>
    </div>
  )
}
