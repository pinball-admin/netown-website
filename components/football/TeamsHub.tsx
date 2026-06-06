'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

interface Team {
  id: string
  name: string
  code: string
  continent: string
  flag: string
  ranking: number
  coach: string
  keyPlayers: string[]
  worldCupTitles: number
  bestResult: string
  lastAppearance: string
}

const continentMap: Record<string, string> = {
  ARG: 'South America', BRA: 'South America', FRA: 'Europe', ENG: 'Europe', ESP: 'Europe', GER: 'Europe',
  ITA: 'Europe', NED: 'Europe', POR: 'Europe', BEL: 'Europe', URU: 'South America', CRO: 'Europe',
  COL: 'South America', MEX: 'North America', USA: 'North America', CAN: 'North America',
  JPN: 'Asia', KOR: 'Asia', IRN: 'Asia', QAT: 'Asia', AUS: 'Asia', MAR: 'Africa', SEN: 'Africa',
  GHA: 'Africa', NGA: 'Africa', CMR: 'Africa', EGY: 'Africa', ALG: 'Africa', TUN: 'Africa',
  ECU: 'South America', PER: 'South America', CHI: 'South America', POL: 'Europe', UKR: 'Europe',
  SWE: 'Europe', SUI: 'Europe', AUT: 'Europe', DEN: 'Europe', NOR: 'Europe', SRB: 'Europe',
  SCO: 'Europe', WAL: 'Europe', NIR: 'Europe', GRE: 'Europe', TUR: 'Europe', ROM: 'Europe',
  HUN: 'Europe', CZE: 'Europe', KSA: 'Asia', JAM: 'North America', NZL: 'Asia', PAN: 'North America',
  PAR: 'South America', VEN: 'South America', FIN: 'Europe', ISL: 'Europe', UAE: 'Asia',
  CRC: 'North America', BIH: 'Europe', HAI: 'North America', CUW: 'North America',
  CIV: 'Africa', CPV: 'Africa', COD: 'Africa', IRQ: 'Asia', JOR: 'Asia', UZB: 'Asia',
  RSA: 'Africa',
}

const teamList: Team[] = [
  { id: 'argentina', name: 'Argentina', code: 'ARG', continent: 'South America', flag: '🇦🇷', ranking: 1, coach: 'Lionel Scaloni', keyPlayers: ['Messi', 'Di Maria', 'Martinez'], worldCupTitles: 3, bestResult: 'Champion (1978, 1986, 2022)', lastAppearance: '2022' },
  { id: 'brazil', name: 'Brazil', code: 'BRA', continent: 'South America', flag: '🇧🇷', ranking: 3, coach: 'Dorival Jr.', keyPlayers: ['Neymar', 'Vinicius Jr.', 'Rodri'], worldCupTitles: 5, bestResult: 'Champion (1958, 1962, 1970, 1994, 2002)', lastAppearance: '2022' },
  { id: 'france', name: 'France', code: 'FRA', continent: 'Europe', flag: '🇫🇷', ranking: 2, coach: 'Didier Deschamps', keyPlayers: ['Mbappe', 'Griezmann', 'Kante'], worldCupTitles: 2, bestResult: 'Champion (1998, 2018)', lastAppearance: '2022' },
  { id: 'england', name: 'England', code: 'ENG', continent: 'Europe', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ranking: 5, coach: 'Gareth Southgate', keyPlayers: ['Kane', 'Rice', 'Foden'], worldCupTitles: 1, bestResult: 'Champion (1966)', lastAppearance: '2022' },
  { id: 'usa', name: 'USA', code: 'USA', continent: 'North America', flag: '🇺🇸', ranking: 11, coach: 'Gregg Berhalter', keyPlayers: ['Pulisic', 'Reyna', 'McKennie'], worldCupTitles: 0, bestResult: 'Quarter-finals (2002)', lastAppearance: '2022' },
  { id: 'germany', name: 'Germany', code: 'GER', continent: 'Europe', flag: '🇩🇪', ranking: 16, coach: 'Julian Nagelsmann', keyPlayers: ['Neuer', 'Kroos', 'Havertz'], worldCupTitles: 4, bestResult: 'Champion (1954, 1974, 1990, 2014)', lastAppearance: '2022' },
  { id: 'spain', name: 'Spain', code: 'ESP', continent: 'Europe', flag: '🇪🇸', ranking: 8, coach: 'Luis de la Fuente', keyPlayers: ['Rodri', 'Pedri', 'Morata'], worldCupTitles: 1, bestResult: 'Champion (2010)', lastAppearance: '2022' },
  { id: 'portugal', name: 'Portugal', code: 'POR', continent: 'Europe', flag: '🇵🇹', ranking: 6, coach: 'Roberto Martinez', keyPlayers: ['Ronaldo', 'B.Silva', 'Fernandes'], worldCupTitles: 0, bestResult: 'Semi-finals (1966, 2006)', lastAppearance: '2022' },
  { id: 'morocco', name: 'Morocco', code: 'MAR', continent: 'Africa', flag: '🇲🇦', ranking: 13, coach: 'Walid Regragui', keyPlayers: ['Hakimi', 'Ziyech', 'Amrabat'], worldCupTitles: 0, bestResult: 'Semi-finals (2022)', lastAppearance: '2022' },
  { id: 'croatia', name: 'Croatia', code: 'CRO', continent: 'Europe', flag: '🇭🇷', ranking: 10, coach: 'Zlatko Dalic', keyPlayers: ['Modric', 'Kovacic', 'Kramaric'], worldCupTitles: 0, bestResult: 'Final (2018)', lastAppearance: '2022' },
  { id: 'netherlands', name: 'Netherlands', code: 'NED', continent: 'Europe', flag: '🇳🇱', ranking: 7, coach: 'Ronald Koeman', keyPlayers: ['van Dijk', 'de Jong', 'Depay'], worldCupTitles: 0, bestResult: 'Final (1974, 1978, 2010)', lastAppearance: '2022' },
  { id: 'japan', name: 'Japan', code: 'JPN', continent: 'Asia', flag: '🇯🇵', ranking: 18, coach: 'Hajime Moriyasu', keyPlayers: ['Kubo', 'Mitoma', 'Tomiyasu'], worldCupTitles: 0, bestResult: 'Round of 16 (2018, 2022)', lastAppearance: '2022' },
  { id: 'mexico', name: 'Mexico', code: 'MEX', continent: 'North America', flag: '🇲🇽', ranking: 12, coach: 'Jaime Lozano', keyPlayers: ['Lozano', 'Jimenez', 'Alvarez'], worldCupTitles: 0, bestResult: 'Quarter-finals (1970, 1986)', lastAppearance: '2022' },
  { id: 'south-korea', name: 'South Korea', code: 'KOR', continent: 'Asia', flag: '🇰🇷', ranking: 24, coach: 'Jurgen Klinsmann', keyPlayers: ['Son', 'Kim', 'Lee'], worldCupTitles: 0, bestResult: 'Semi-finals (2002)', lastAppearance: '2022' },
  { id: 'czech-republic', name: 'Czech Republic', code: 'CZE', continent: 'Europe', flag: '🇨🇿', ranking: 32, coach: 'Jaroslav Silhavy', keyPlayers: ['Schick', 'Soucek', 'Coufal'], worldCupTitles: 0, bestResult: 'Final (1934, 1962)', lastAppearance: '2022' },
  { id: 'south-africa', name: 'South Africa', code: 'RSA', continent: 'Africa', flag: '🇿🇦', ranking: 60, coach: 'Hugo Broos', keyPlayers: ['Tau', 'Foster', 'Mokoena'], worldCupTitles: 0, bestResult: 'Group Stage', lastAppearance: '2010' },
  { id: 'canada', name: 'Canada', code: 'CAN', continent: 'North America', flag: '🇨🇦', ranking: 48, coach: 'John Herdman', keyPlayers: ['Davies', 'David', 'Eustaquio'], worldCupTitles: 0, bestResult: 'Group Stage', lastAppearance: '2022' },
  { id: 'bosnia', name: 'Bosnia and Herzegovina', code: 'BIH', continent: 'Europe', flag: '🇧🇦', ranking: 45, coach: 'Savo Milosevic', keyPlayers: ['Dzeko', 'Pjanic', 'Kolasinac'], worldCupTitles: 0, bestResult: 'Group Stage (2014)', lastAppearance: '2014' },
  { id: 'qatar', name: 'Qatar', code: 'QAT', continent: 'Asia', flag: '🇶🇦', ranking: 58, coach: 'Carlos Queiroz', keyPlayers: ['Afif', 'Ali', 'Al-Haydos'], worldCupTitles: 0, bestResult: 'Group Stage (2022)', lastAppearance: '2022' },
  { id: 'switzerland', name: 'Switzerland', code: 'SUI', continent: 'Europe', flag: '🇨🇭', ranking: 19, coach: 'Murat Yakin', keyPlayers: ['Xhaka', 'Embolo', 'Akanji'], worldCupTitles: 0, bestResult: 'Quarter-finals (2014)', lastAppearance: '2022' },
  { id: 'haiti', name: 'Haiti', code: 'HAI', continent: 'North America', flag: '🇭🇹', ranking: 80, coach: 'Gabriel Calderon', keyPlayers: ['Nazon', 'Pierrot', 'Placide'], worldCupTitles: 0, bestResult: 'First appearance (2026)', lastAppearance: '-' },
  { id: 'scotland', name: 'Scotland', code: 'SCO', continent: 'Europe', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', ranking: 42, coach: 'Steve Clarke', keyPlayers: ['Robertson', 'McTominay', 'McGinn'], worldCupTitles: 0, bestResult: 'Group Stage (1998)', lastAppearance: '1998' },
  { id: 'paraguay', name: 'Paraguay', code: 'PAR', continent: 'South America', flag: '🇵🇾', ranking: 38, coach: 'Guillermo Barros Schelotto', keyPlayers: ['Almiron', 'Enciso', 'Balbuena'], worldCupTitles: 0, bestResult: 'Quarter-finals (2010)', lastAppearance: '2010' },
  { id: 'australia', name: 'Australia', code: 'AUS', continent: 'Asia', flag: '🇦🇺', ranking: 23, coach: 'Graham Arnold', keyPlayers: ['Ryan', 'Hrustic', 'Duke'], worldCupTitles: 0, bestResult: 'Round of 16 (2022)', lastAppearance: '2022' },
  { id: 'turkey', name: 'Turkey', code: 'TUR', continent: 'Europe', flag: '🇹🇷', ranking: 29, coach: 'Vincenzo Montella', keyPlayers: ['Calhanoglu', 'Under', 'Demiral'], worldCupTitles: 0, bestResult: 'Semi-finals (2002)', lastAppearance: '2002' },
  { id: 'curacao', name: 'Curacao', code: 'CUW', continent: 'North America', flag: '🇨🇼', ranking: 85, coach: 'Remko Bicentini', keyPlayers: ['Bacuna', 'Janga', 'Martina'], worldCupTitles: 0, bestResult: 'First appearance (2026)', lastAppearance: '-' },
  { id: 'ecuador', name: 'Ecuador', code: 'ECU', continent: 'South America', flag: '🇪🇨', ranking: 34, coach: 'Felix Sanchez', keyPlayers: ['Caicedo', 'Valencia', 'Estupinan'], worldCupTitles: 0, bestResult: 'Round of 16 (2006)', lastAppearance: '2022' },
  { id: 'ivory-coast', name: 'Ivory Coast', code: 'CIV', continent: 'Africa', flag: '🇨🇮', ranking: 44, coach: 'Jean-Louis Gasset', keyPlayers: ['Kessie', 'Haller', 'Aurier'], worldCupTitles: 0, bestResult: 'Group Stage', lastAppearance: '2022' },
  { id: 'sweden', name: 'Sweden', code: 'SWE', continent: 'Europe', flag: '🇸🇪', ranking: 26, coach: 'Janne Andersson', keyPlayers: ['Isak', 'Kulusevski', 'Lindelof'], worldCupTitles: 0, bestResult: 'Final (1958)', lastAppearance: '2018' },
  { id: 'tunisia', name: 'Tunisia', code: 'TUN', continent: 'Africa', flag: '🇹🇳', ranking: 30, coach: 'Jalel Kadri', keyPlayers: ['Khazri', 'Skhiri', 'Laidouni'], worldCupTitles: 0, bestResult: 'Group Stage', lastAppearance: '2022' },
  { id: 'belgium', name: 'Belgium', code: 'BEL', continent: 'Europe', flag: '🇧🇪', ranking: 15, coach: 'Teddy Dom', keyPlayers: ['De Bruyne', 'Lukaku', 'Doku'], worldCupTitles: 0, bestResult: 'Semi-finals (2018)', lastAppearance: '2022' },
  { id: 'egypt', name: 'Egypt', code: 'EGY', continent: 'Africa', flag: '🇪🇬', ranking: 35, coach: 'Rui Vitoria', keyPlayers: ['Salah', 'Elneny', 'Marmoush'], worldCupTitles: 0, bestResult: 'Group Stage (2018)', lastAppearance: '2018' },
  { id: 'iran', name: 'Iran', code: 'IRN', continent: 'Asia', flag: '🇮🇷', ranking: 22, coach: 'Amir Ghalenoei', keyPlayers: ['Taremi', 'Azmoun', 'Ghoddos'], worldCupTitles: 0, bestResult: 'Group Stage', lastAppearance: '2022' },
  { id: 'new-zealand', name: 'New Zealand', code: 'NZL', continent: 'Asia', flag: '🇳🇿', ranking: 101, coach: 'Danny Hay', keyPlayers: ['Wood', 'Thomas', 'Reid'], worldCupTitles: 0, bestResult: 'Group Stage (2010)', lastAppearance: '2010' },
  { id: 'cape-verde', name: 'Cape Verde', code: 'CPV', continent: 'Africa', flag: '🇨🇻', ranking: 73, coach: 'Bubista', keyPlayers: ['Mendes', 'Monteiro', 'Lopes'], worldCupTitles: 0, bestResult: 'First appearance (2026)', lastAppearance: '-' },
  { id: 'saudi-arabia', name: 'Saudi Arabia', code: 'KSA', continent: 'Asia', flag: '🇸🇦', ranking: 54, coach: 'Herve Renard', keyPlayers: ['Al-Dawsari', 'Al-Faraj', 'Al-Owais'], worldCupTitles: 0, bestResult: 'Round of 16 (1994)', lastAppearance: '2022' },
  { id: 'uruguay', name: 'Uruguay', code: 'URU', continent: 'South America', flag: '🇺🇾', ranking: 14, coach: 'Marcelo Bielsa', keyPlayers: ['Valverde', 'Nunez', 'Araujo'], worldCupTitles: 2, bestResult: 'Champion (1930, 1950)', lastAppearance: '2022' },
  { id: 'senegal', name: 'Senegal', code: 'SEN', continent: 'Africa', flag: '🇸🇳', ranking: 20, coach: 'Aliou Cisse', keyPlayers: ['Mane', 'Mendy', 'Koulibaly'], worldCupTitles: 0, bestResult: 'Quarter-finals (2002)', lastAppearance: '2022' },
  { id: 'iraq', name: 'Iraq', code: 'IRQ', continent: 'Asia', flag: '🇮🇶', ranking: 63, coach: 'Jesus Casas', keyPlayers: ['Adnan', 'Ali', 'Attwan'], worldCupTitles: 0, bestResult: 'Group Stage (1986)', lastAppearance: '1986' },
  { id: 'norway', name: 'Norway', code: 'NOR', continent: 'Europe', flag: '🇳🇴', ranking: 31, coach: 'Stale Solbakken', keyPlayers: ['Haaland', 'Odegaard', 'Bobb'], worldCupTitles: 0, bestResult: 'Round of 16 (1998)', lastAppearance: '1998' },
  { id: 'algeria', name: 'Algeria', code: 'ALG', continent: 'Africa', flag: '🇩🇿', ranking: 33, coach: 'Djamel Belmadi', keyPlayers: ['Mahrez', 'Slimani', 'Bensebaini'], worldCupTitles: 0, bestResult: 'Round of 16 (2014)', lastAppearance: '2014' },
  { id: 'austria', name: 'Austria', code: 'AUT', continent: 'Europe', flag: '🇦🇹', ranking: 36, coach: 'Ralf Rangnick', keyPlayers: ['Alaba', 'Sabitzer', 'Laimer'], worldCupTitles: 0, bestResult: 'Group Stage', lastAppearance: '1998' },
  { id: 'jordan', name: 'Jordan', code: 'JOR', continent: 'Asia', flag: '🇯🇴', ranking: 70, coach: 'Hussein Ammouta', keyPlayers: ['Al-Taamari', 'Al-Naimat', 'Marei'], worldCupTitles: 0, bestResult: 'First appearance (2026)', lastAppearance: '-' },
  { id: 'dr-congo', name: 'DR Congo', code: 'COD', continent: 'Africa', flag: '🇨🇩', ranking: 65, coach: 'Sebastien Desabre', keyPlayers: ['Bakambu', 'Wissa', 'Mbemba'], worldCupTitles: 0, bestResult: 'Group Stage (1974)', lastAppearance: '1974' },
  { id: 'uzbekistan', name: 'Uzbekistan', code: 'UZB', continent: 'Asia', flag: '🇺🇿', ranking: 68, coach: 'Srecko Katanec', keyPlayers: ['Shomurodov', 'Khamrobekov', 'Sayfiev'], worldCupTitles: 0, bestResult: 'First appearance (2026)', lastAppearance: '-' },
  { id: 'colombia', name: 'Colombia', code: 'COL', continent: 'South America', flag: '🇨🇴', ranking: 23, coach: 'Nestor Lorenzo', keyPlayers: ['Diaz', 'Borre', 'Sanchez'], worldCupTitles: 0, bestResult: 'Quarter-finals (2014)', lastAppearance: '2018' },
  { id: 'ghana', name: 'Ghana', code: 'GHA', continent: 'Africa', flag: '🇬🇭', ranking: 52, coach: 'Chris Hughton', keyPlayers: ['Kudus', 'Partey', 'I.Williams'], worldCupTitles: 0, bestResult: 'Quarter-finals (2010)', lastAppearance: '2022' },
  { id: 'panama', name: 'Panama', code: 'PAN', continent: 'North America', flag: '🇵🇦', ranking: 56, coach: 'Thomas Christiansen', keyPlayers: ['Diaz', 'Godoy', 'Cummings'], worldCupTitles: 0, bestResult: 'Group Stage (2018)', lastAppearance: '2018' },
]

export default function TeamsHub() {
  const { t, tTeam } = useI18n()
  const [selectedContinent, setSelectedContinent] = useState('All')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const continents = [
    { key: 'All', label: t('teamsHub.all') },
    { key: 'Europe', label: t('teamsHub.europe') },
    { key: 'South America', label: t('teamsHub.southAmerica') },
    { key: 'North America', label: t('teamsHub.northAmerica') },
    { key: 'Africa', label: t('teamsHub.africa') },
    { key: 'Asia', label: t('teamsHub.asia') }
  ]

  const filteredTeams = selectedContinent === 'All'
    ? teamList
    : teamList.filter(t => t.continent === selectedContinent)

  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="text-xl">🌍</span>
        {t('teamsHub.title')}
      </h2>

      {/* Continent Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {continents.map((continent) => (
          <button
            key={continent.key}
            onClick={() => setSelectedContinent(continent.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              selectedContinent === continent.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-transparent hover:text-white'
            }`}
          >
            {continent.label}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {filteredTeams.map((team) => (
          <Link
            key={team.id}
            href={`/football/teams/${team.id}`}
            className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
              selectedTeam?.id === team.id
                ? 'bg-cyan-500/20 border-cyan-500/50'
                : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl mb-1">{team.flag}</div>
            <div className="text-[10px] font-medium text-slate-300 truncate">{t(`teams.${team.code}`)}</div>
          </Link>
        ))}
      </div>

      {/* Team Detail Card */}
      {selectedTeam && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{selectedTeam.flag}</div>
            <div>
              <h3 className="text-white font-bold text-lg">{tTeam(selectedTeam.code)}</h3>
              <p className="text-slate-400 text-sm">{t('team.fifaRank')}: #{selectedTeam.ranking}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">{t('teamsHub.headCoach')}</p>
              <p className="text-white font-medium">{selectedTeam.coach}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">{t('teamsHub.worldCupTitles')}</p>
              <p className="text-amber-400 font-bold">{selectedTeam.worldCupTitles} 🏆</p>
            </div>
          </div>

          <div className="mt-3 bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-500 text-xs mb-2">{t('teamsHub.keyPlayers')}</p>
            <div className="flex flex-wrap gap-1">
              {selectedTeam.keyPlayers.map((player, idx) => (
                <span key={idx} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {player}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 bg-slate-900/50 rounded-lg p-3">
            <p className="text-slate-500 text-xs mb-1">{t('teamsHub.bestResult')}</p>
            <p className="text-white text-sm">{selectedTeam.bestResult}</p>
          </div>
        </div>
      )}

      {filteredTeams.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-4xl mb-2">🔍</p>
          <p>{t('teamsHub.noTeams')}</p>
        </div>
      )}
    </div>
  )
}
