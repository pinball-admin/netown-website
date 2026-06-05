import { Team, Match, TeamStats } from '../types'

const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4'
const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN || ''

export interface FootballDataTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  country: string
  area?: { name: string }
}

export interface FootballDataMatch {
  id: number
  homeTeam: FootballDataTeam
  awayTeam: FootballDataTeam
  utcDate: string
  status: string
  score: {
    fullTime: { home: number; away: number }
    halfTime: { home: number; away: number }
  }
  competition: { name: string; code: string }
}

const TEAM_NAME_MAPPING: Record<string, string> = {
  'mexico': 'MEX', 'south korea': 'KOR', 'korea': 'KOR', 'czech republic': 'CZE', 'south africa': 'RSA',
  'canada': 'CAN', 'bosnia': 'BIH', 'bosnia and herzegovina': 'BIH', 'qatar': 'QAT', 'switzerland': 'SUI',
  'brazil': 'BRA', 'morocco': 'MAR', 'haiti': 'HAI', 'scotland': 'SCO',
  'usa': 'USA', 'united states': 'USA', 'paraguay': 'PAR', 'australia': 'AUS', 'turkey': 'TUR',
  'germany': 'GER', 'curacao': 'CUW', 'ecuador': 'ECU', 'ivory coast': 'CIV',
  'netherlands': 'NED', 'japan': 'JPN', 'sweden': 'SWE', 'tunisia': 'TUN',
  'belgium': 'BEL', 'egypt': 'EGY', 'iran': 'IRN', 'new zealand': 'NZL',
  'spain': 'ESP', 'cape verde': 'CPV', 'saudi arabia': 'KSA', 'uruguay': 'URU',
  'france': 'FRA', 'senegal': 'SEN', 'iraq': 'IRQ', 'norway': 'NOR',
  'argentina': 'ARG', 'algeria': 'ALG', 'austria': 'AUT', 'jordan': 'JOR',
  'portugal': 'POR', 'dr congo': 'COD', 'uzbekistan': 'UZB', 'colombia': 'COL',
  'england': 'ENG', 'croatia': 'CRO', 'ghana': 'GHA', 'panama': 'PAN',
}

export function getTeamCode(teamName: string): string {
  const lower = teamName.toLowerCase()
  return TEAM_NAME_MAPPING[lower] || teamName.substring(0, 3).toUpperCase()
}

async function fetchFromFootballData(endpoint: string): Promise<any> {
  if (!FOOTBALL_DATA_TOKEN) {
    console.warn('FOOTBALL_DATA_API_TOKEN not set, using mock data')
    return null
  }

  try {
    const response = await fetch(`${FOOTBALL_DATA_BASE_URL}${endpoint}`, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_TOKEN,
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.warn(`Football-data API error: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Football-data API fetch error:', error)
    return null
  }
}

export async function fetchTeamData(teamCode: string): Promise<TeamStats | null> {
  const data = await fetchFromFootballData(`/teams/${teamCode}`)

  if (!data) {
    return getMockTeamStats(teamCode)
  }

  return {
    id: data.id?.toString() || teamCode,
    name: data.name || teamCode,
    shortName: data.shortName || data.tla || teamCode,
    flag: data.crest || '🏳️',
    founded: data.founded || 1900,
    stadium: data.venue || 'Unknown Stadium',
    capacity: data.capacity || 0,
    manager: 'TBD',
    ranking: 0,
    group: 'A',
    players: []
  }
}

export async function fetchAllWorldCupTeams(): Promise<TeamStats[]> {
  const wcCompetitions = [2001, 2018, 2022]

  for (const compId of wcCompetitions) {
    const data = await fetchFromFootballData(`/competitions/${compId}/teams`)

    if (data?.teams) {
      return data.teams.map((team: FootballDataTeam) => ({
        id: team.id.toString(),
        name: team.name,
        shortName: team.tla || team.shortName,
        flag: team.crest || getTeamFlag(team.name),
        founded: 1900,
        stadium: 'Stadium',
        capacity: 0,
        manager: 'TBD',
        ranking: 0,
        group: 'A',
        players: []
      }))
    }
  }

  return getMockAllTeams()
}

export async function fetchWorldCupMatches(): Promise<Match[]> {
  const data = await fetchFromFootballData('/competitions/WC/matches')

  if (!data?.matches) {
    return []
  }

  return data.matches.map((match: FootballDataMatch) => ({
    id: match.id.toString(),
    homeTeam: {
      id: match.homeTeam.tla || match.homeTeam.shortName || 'UNK',
      name: match.homeTeam.name,
      shortName: match.homeTeam.tla || match.homeTeam.shortName,
      flag: match.homeTeam.crest || getTeamFlag(match.homeTeam.name),
      group: 'A'
    },
    awayTeam: {
      id: match.awayTeam.tla || match.awayTeam.shortName || 'UNK',
      name: match.awayTeam.name,
      shortName: match.awayTeam.tla || match.awayTeam.shortName,
      flag: match.awayTeam.crest || getTeamFlag(match.awayTeam.name),
      group: 'A'
    },
    date: match.utcDate.split('T')[0],
    time: match.utcDate.split('T')[1]?.substring(0, 5) || '12:00',
    venue: 'Stadium',
    group: 'Group A',
    status: mapMatchStatus(match.status),
    score: match.score?.fullTime ? {
      home: match.score.fullTime.home,
      away: match.score.fullTime.away
    } : undefined,
    round: getMatchRound(match)
  }))
}

function mapMatchStatus(status: string): 'scheduled' | 'live' | 'finished' | 'postponed' {
  const statusMap: Record<string, 'scheduled' | 'live' | 'finished' | 'postponed'> = {
    'SCHEDULED': 'scheduled',
    'TIMED': 'scheduled',
    'IN_PLAY': 'live',
    'PLAYING': 'live',
    'FINISHED': 'finished',
    'POSTPONED': 'postponed',
  }
  return statusMap[status] || 'scheduled'
}

function getMatchRound(match: FootballDataMatch): string {
  const stage = match.competition?.code
  if (stage?.includes('GROUP')) return 'Group Stage'
  if (stage?.includes('ROUND_16')) return 'Round of 16'
  if (stage?.includes('QUARTER')) return 'Quarter Finals'
  if (stage?.includes('SEMI')) return 'Semi Finals'
  if (stage?.includes('FINAL')) return 'Final'
  return 'Group Stage'
}

function getTeamFlag(teamName: string): string {
  const flags: Record<string, string> = {
    'mexico': '🇲🇽', 'south korea': '🇰🇷', 'korea': '🇰🇷', 'czech republic': '🇨🇿', 'south africa': '🇿🇦',
    'canada': '🇨🇦', 'bosnia': '🇧🇦', 'qatar': '🇶🇦', 'switzerland': '🇨🇭',
    'brazil': '🇧🇷', 'morocco': '🇲🇦', 'haiti': '🇭🇹', 'scotland': '🏴',
    'usa': '🇺🇸', 'united states': '🇺🇸', 'paraguay': '🇵🇾', 'australia': '🇦🇺', 'turkey': '🇹🇷',
    'germany': '🇩🇪', 'curacao': '🇨🇼', 'ecuador': '🇪🇨', 'ivory coast': '🇨🇮',
    'netherlands': '🇳🇱', 'japan': '🇯🇵', 'sweden': '🇸🇪', 'tunisia': '🇹🇳',
    'belgium': '🇧🇪', 'egypt': '🇪🇬', 'iran': '🇮🇷', 'new zealand': '🇳🇿',
    'spain': '🇪🇸', 'cape verde': '🇨🇻', 'saudi arabia': '🇸🇦', 'uruguay': '🇺🇾',
    'france': '🇫🇷', 'senegal': '🇸🇳', 'iraq': '🇮🇶', 'norway': '🇳🇴',
    'argentina': '🇦🇷', 'algeria': '🇩🇿', 'austria': '🇦🇹', 'jordan': '🇯🇴',
    'portugal': '🇵🇹', 'dr congo': '🇨🇩', 'uzbekistan': '🇺🇿', 'colombia': '🇨🇴',
    'england': '🏴', 'croatia': '🇭🇷', 'ghana': '🇬🇭', 'panama': '🇵🇦',
  }
  const lower = teamName.toLowerCase()
  for (const [key, flag] of Object.entries(flags)) {
    if (lower.includes(key)) return flag
  }
  return '🏳️'
}

export function getMockTeamStats(teamCode: string): TeamStats {
  const mockTeams: Record<string, TeamStats> = {
    'MEX': { id: 'MEX', name: 'Mexico', shortName: 'MEX', flag: '🇲🇽', founded: 1927, stadium: 'Azteca Stadium', capacity: 87000, manager: 'Diego Cocca', ranking: 11, group: 'Group A', players: [], league: 'Liga MX', country: 'Mexico', stats: { played: 10, won: 4, drawn: 4, lost: 2, goalsFor: 13, goalsAgainst: 9, points: 16 } },
    'KOR': { id: 'KOR', name: 'South Korea', shortName: 'KOR', flag: '🇰🇷', founded: 1945, stadium: 'Seoul World Cup Stadium', capacity: 66000, manager: 'Jurgen Klinsmann', ranking: 24, group: 'Group A', players: [], league: 'K League 1', country: 'South Korea', stats: { played: 10, won: 3, drawn: 4, lost: 3, goalsFor: 12, goalsAgainst: 11, points: 13 } },
    'CZE': { id: 'CZE', name: 'Czech Republic', shortName: 'CZE', flag: '🇨🇿', founded: 1993, stadium: 'Sinobo Stadium', capacity: 19000, manager: 'Jaroslav Silhavy', ranking: 32, group: 'Group A', players: [], league: 'Czech First League', country: 'Czech Republic', stats: { played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 11, goalsAgainst: 12, points: 12 } },
    'RSA': { id: 'RSA', name: 'South Africa', shortName: 'RSA', flag: '🇿🇦', founded: 1992, stadium: 'FNB Stadium', capacity: 94000, manager: 'Hugo Broos', ranking: 60, group: 'Group A', players: [], league: 'PSL', country: 'South Africa', stats: { played: 10, won: 2, drawn: 3, lost: 5, goalsFor: 8, goalsAgainst: 15, points: 9 } },
    'CAN': { id: 'CAN', name: 'Canada', shortName: 'CAN', flag: '🇨🇦', founded: 1885, stadium: 'BMO Field', capacity: 45000, manager: 'John Herdman', ranking: 48, group: 'Group B', players: [], league: 'MLS', country: 'Canada', stats: { played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 10, goalsAgainst: 12, points: 12 } },
    'BIH': { id: 'BIH', name: 'Bosnia and Herzegovina', shortName: 'BIH', flag: '🇧🇦', founded: 1992, stadium: 'Grbavica Stadium', capacity: 16000, manager: 'Savo Milosevic', ranking: 45, group: 'Group B', players: [], league: 'Premier League BH', country: 'Bosnia and Herzegovina', stats: { played: 10, won: 2, drawn: 3, lost: 5, goalsFor: 7, goalsAgainst: 14, points: 9 } },
    'QAT': { id: 'QAT', name: 'Qatar', shortName: 'QAT', flag: '🇶🇦', founded: 1970, stadium: 'Al Bayt Stadium', capacity: 60000, manager: 'Carlos Queiroz', ranking: 58, group: 'Group B', players: [], league: 'Qatar Stars League', country: 'Qatar', stats: { played: 10, won: 3, drawn: 2, lost: 5, goalsFor: 9, goalsAgainst: 15, points: 11 } },
    'SUI': { id: 'SUI', name: 'Switzerland', shortName: 'SUI', flag: '🇨🇭', founded: 1895, stadium: 'St. Jakob-Park', capacity: 38000, manager: 'Murat Yakin', ranking: 19, group: 'Group B', players: [], league: 'Super League', country: 'Switzerland', stats: { played: 10, won: 4, drawn: 3, lost: 3, goalsFor: 12, goalsAgainst: 9, points: 15 } },
    'BRA': { id: 'BRA', name: 'Brazil', shortName: 'BRA', flag: '🇧🇷', founded: 1914, stadium: 'Maracana', capacity: 78000, manager: 'Dorival Jr', ranking: 3, group: 'Group C', players: [], league: 'Brasileirao', country: 'Brazil', stats: { played: 10, won: 8, drawn: 1, lost: 1, goalsFor: 25, goalsAgainst: 6, points: 25 } },
    'MAR': { id: 'MAR', name: 'Morocco', shortName: 'MAR', flag: '🇲🇦', founded: 1956, stadium: 'Mohammed V Stadium', capacity: 67000, manager: 'Walid Regragui', ranking: 12, group: 'Group C', players: [], league: 'Botola', country: 'Morocco', stats: { played: 10, won: 5, drawn: 3, lost: 2, goalsFor: 14, goalsAgainst: 8, points: 18 } },
    'HAI': { id: 'HAI', name: 'Haiti', shortName: 'HAI', flag: '🇭🇹', founded: 1904, stadium: 'Stade Sylvio Cator', capacity: 15000, manager: 'Gabriel Calderon', ranking: 80, group: 'Group C', players: [], league: 'Ligue Haïtienne', country: 'Haiti', stats: { played: 10, won: 1, drawn: 2, lost: 7, goalsFor: 5, goalsAgainst: 20, points: 5 } },
    'SCO': { id: 'SCO', name: 'Scotland', shortName: 'SCO', flag: '🏴', founded: 1873, stadium: 'Hampden Park', capacity: 52000, manager: 'Steve Clarke', ranking: 42, group: 'Group C', players: [], league: 'Scottish Premiership', country: 'Scotland', stats: { played: 10, won: 2, drawn: 4, lost: 4, goalsFor: 8, goalsAgainst: 13, points: 10 } },
    'USA': { id: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', founded: 1913, stadium: 'MetLife Stadium', capacity: 82000, manager: 'Gregg Berhalter', ranking: 16, group: 'Group D', players: [], league: 'MLS', country: 'United States', stats: { played: 10, won: 5, drawn: 3, lost: 2, goalsFor: 14, goalsAgainst: 8, points: 18 } },
    'PAR': { id: 'PAR', name: 'Paraguay', shortName: 'PAR', flag: '🇵🇾', founded: 1906, stadium: 'Estadio Defensores del Chaco', capacity: 42000, manager: 'Guillermo Barros Schelotto', ranking: 38, group: 'Group D', players: [], league: 'Primera Division', country: 'Paraguay', stats: { played: 10, won: 2, drawn: 5, lost: 3, goalsFor: 8, goalsAgainst: 11, points: 11 } },
    'AUS': { id: 'AUS', name: 'Australia', shortName: 'AUS', flag: '🇦🇺', founded: 1963, stadium: 'Stadium Australia', capacity: 83000, manager: 'Graham Arnold', ranking: 23, group: 'Group D', players: [], league: 'A-League', country: 'Australia', stats: { played: 10, won: 3, drawn: 4, lost: 3, goalsFor: 11, goalsAgainst: 12, points: 13 } },
    'TUR': { id: 'TUR', name: 'Turkey', shortName: 'TUR', flag: '🇹🇷', founded: 1923, stadium: 'Ataturk Olympic Stadium', capacity: 76000, manager: 'Vincenzo Montella', ranking: 29, group: 'Group D', players: [], league: 'Super Lig', country: 'Turkey', stats: { played: 10, won: 4, drawn: 2, lost: 4, goalsFor: 13, goalsAgainst: 12, points: 14 } },
    'GER': { id: 'GER', name: 'Germany', shortName: 'GER', flag: '🇩🇪', founded: 1900, stadium: 'Allianz Arena', capacity: 75000, manager: 'Julian Nagelsmann', ranking: 13, group: 'Group E', players: [], league: 'Bundesliga', country: 'Germany', stats: { played: 10, won: 6, drawn: 2, lost: 2, goalsFor: 19, goalsAgainst: 10, points: 20 } },
    'CUW': { id: 'CUW', name: 'Curacao', shortName: 'CUW', flag: '🇨🇼', founded: 1921, stadium: 'Ergilio Hato Stadium', capacity: 15000, manager: 'Remko Bicentini', ranking: 85, group: 'Group E', players: [], league: 'Curaçao League', country: 'Curacao', stats: { played: 10, won: 1, drawn: 1, lost: 8, goalsFor: 4, goalsAgainst: 22, points: 4 } },
    'ECU': { id: 'ECU', name: 'Ecuador', shortName: 'ECU', flag: '🇪🇨', founded: 1925, stadium: 'Estadio Rodrigo Paz Delgado', capacity: 41000, manager: 'Felix Sanchez', ranking: 34, group: 'Group E', players: [], league: 'Serie A', country: 'Ecuador', stats: { played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 10, goalsAgainst: 13, points: 12 } },
    'CIV': { id: 'CIV', name: 'Ivory Coast', shortName: 'CIV', flag: '🇨🇮', founded: 1960, stadium: 'Stade Félix Houphouët-Boigny', capacity: 45000, manager: 'Jean-Louis Gasset', ranking: 44, group: 'Group E', players: [], league: 'Ligue 1', country: 'Ivory Coast', stats: { played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 9, goalsAgainst: 12, points: 12 } },
    'NED': { id: 'NED', name: 'Netherlands', shortName: 'NED', flag: '🇳🇱', founded: 1889, stadium: 'Johan Cruyff Arena', capacity: 55000, manager: 'Ronald Koeman', ranking: 7, group: 'Group F', players: [], league: 'Eredivisie', country: 'Netherlands', stats: { played: 10, won: 5, drawn: 4, lost: 1, goalsFor: 16, goalsAgainst: 8, points: 19 } },
    'JPN': { id: 'JPN', name: 'Japan', shortName: 'JPN', flag: '🇯🇵', founded: 1921, stadium: 'National Stadium', capacity: 60000, manager: 'Hajime Moriyasu', ranking: 18, group: 'Group F', players: [], league: 'J1 League', country: 'Japan', stats: { played: 10, won: 4, drawn: 3, lost: 3, goalsFor: 11, goalsAgainst: 10, points: 15 } },
    'SWE': { id: 'SWE', name: 'Sweden', shortName: 'SWE', flag: '🇸🇪', founded: 1904, stadium: 'Friends Arena', capacity: 50000, manager: 'Janne Andersson', ranking: 26, group: 'Group F', players: [], league: 'Allsvenskan', country: 'Sweden', stats: { played: 10, won: 3, drawn: 4, lost: 3, goalsFor: 11, goalsAgainst: 10, points: 13 } },
    'TUN': { id: 'TUN', name: 'Tunisia', shortName: 'TUN', flag: '🇹🇳', founded: 1957, stadium: 'Stade Olympique de Radès', capacity: 60000, manager: 'Jalel Kadri', ranking: 30, group: 'Group F', players: [], league: 'Ligue 1', country: 'Tunisia', stats: { played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 10, goalsAgainst: 12, points: 12 } },
    'BEL': { id: 'BEL', name: 'Belgium', shortName: 'BEL', flag: '🇧🇪', founded: 1895, stadium: 'King Baudouin Stadium', capacity: 50000, manager: 'Teddy Dom', ranking: 15, group: 'Group G', players: [], league: 'Belgian Pro League', country: 'Belgium', stats: { played: 10, won: 5, drawn: 3, lost: 2, goalsFor: 14, goalsAgainst: 9, points: 18 } },
    'EGY': { id: 'EGY', name: 'Egypt', shortName: 'EGY', flag: '🇪🇬', founded: 1921, stadium: 'Cairo International Stadium', capacity: 75000, manager: 'Rui Vitoria', ranking: 35, group: 'Group G', players: [], league: 'Egyptian Premier League', country: 'Egypt', stats: { played: 10, won: 4, drawn: 2, lost: 4, goalsFor: 12, goalsAgainst: 11, points: 14 } },
    'IRN': { id: 'IRN', name: 'Iran', shortName: 'IRN', flag: '🇮🇷', founded: 1920, stadium: 'Azadi Stadium', capacity: 78000, manager: 'Carlos Queiroz', ranking: 22, group: 'Group G', players: [], league: 'Persian Gulf Pro League', country: 'Iran', stats: { played: 10, won: 4, drawn: 2, lost: 4, goalsFor: 12, goalsAgainst: 11, points: 14 } },
    'NZL': { id: 'NZL', name: 'New Zealand', shortName: 'NZL', flag: '🇳🇿', founded: 1891, stadium: 'Sky Stadium', capacity: 34000, manager: 'Danny Hay', ranking: 101, group: 'Group G', players: [], league: 'A-League', country: 'New Zealand', stats: { played: 10, won: 1, drawn: 2, lost: 7, goalsFor: 5, goalsAgainst: 18, points: 5 } },
    'ESP': { id: 'ESP', name: 'Spain', shortName: 'ESP', flag: '🇪🇸', founded: 1909, stadium: 'Santiago Bernabeu', capacity: 81000, manager: 'Luis de la Fuente', ranking: 8, group: 'Group H', players: [], league: 'La Liga', country: 'Spain', stats: { played: 10, won: 6, drawn: 3, lost: 1, goalsFor: 17, goalsAgainst: 6, points: 21 } },
    'CPV': { id: 'CPV', name: 'Cape Verde', shortName: 'CPV', flag: '🇨🇻', founded: 1975, stadium: 'Estádio Nacional de Cabo Verde', capacity: 15000, manager: 'Bubista', ranking: 73, group: 'Group H', players: [], league: 'Cape Verdean League', country: 'Cape Verde', stats: { played: 10, won: 2, drawn: 2, lost: 6, goalsFor: 6, goalsAgainst: 16, points: 8 } },
    'KSA': { id: 'KSA', name: 'Saudi Arabia', shortName: 'KSA', flag: '🇸🇦', founded: 1956, stadium: 'King Fahd International Stadium', capacity: 68000, manager: 'Herve Renard', ranking: 54, group: 'Group H', players: [], league: 'Saudi Pro League', country: 'Saudi Arabia', stats: { played: 10, won: 2, drawn: 4, lost: 4, goalsFor: 8, goalsAgainst: 14, points: 10 } },
    'URU': { id: 'URU', name: 'Uruguay', shortName: 'URU', flag: '🇺🇾', founded: 1900, stadium: 'Estadio Centenario', capacity: 60000, manager: 'Marcelo Bielsa', ranking: 14, group: 'Group H', players: [], league: 'Primera Division', country: 'Uruguay', stats: { played: 10, won: 5, drawn: 2, lost: 3, goalsFor: 15, goalsAgainst: 11, points: 17 } },
    'FRA': { id: 'FRA', name: 'France', shortName: 'FRA', flag: '🇫🇷', founded: 1919, stadium: 'Stade de France', capacity: 80000, manager: 'Didier Deschamps', ranking: 2, group: 'Group I', players: [], league: 'Ligue 1', country: 'France', stats: { played: 10, won: 6, drawn: 3, lost: 1, goalsFor: 18, goalsAgainst: 7, points: 21 } },
    'SEN': { id: 'SEN', name: 'Senegal', shortName: 'SEN', flag: '🇸🇳', founded: 1960, stadium: 'Stade de la Peace', capacity: 60000, manager: 'Aliou Cisse', ranking: 20, group: 'Group I', players: [], league: 'Ligue 1', country: 'Senegal', stats: { played: 10, won: 4, drawn: 3, lost: 3, goalsFor: 13, goalsAgainst: 10, points: 15 } },
    'IRQ': { id: 'IRQ', name: 'Iraq', shortName: 'IRQ', flag: '🇮🇶', founded: 1948, stadium: 'Basra Sports City', capacity: 65000, manager: 'Jesus Casas', ranking: 63, group: 'Group I', players: [], league: 'Iraqi Premier League', country: 'Iraq', stats: { played: 10, won: 2, drawn: 3, lost: 5, goalsFor: 7, goalsAgainst: 14, points: 9 } },
    'NOR': { id: 'NOR', name: 'Norway', shortName: 'NOR', flag: '🇳🇴', founded: 1908, stadium: 'Ullevaal Stadion', capacity: 28000, manager: 'Stale Solbakken', ranking: 31, group: 'Group I', players: [], league: 'Eliteserien', country: 'Norway', stats: { played: 10, won: 3, drawn: 4, lost: 3, goalsFor: 11, goalsAgainst: 10, points: 13 } },
    'ARG': { id: 'ARG', name: 'Argentina', shortName: 'ARG', flag: '🇦🇷', founded: 1893, stadium: 'Estadio Monumental', capacity: 70000, manager: 'Lionel Scaloni', ranking: 1, group: 'Group J', players: [], league: 'Argentine Primera Division', country: 'Argentina', stats: { played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 20, goalsAgainst: 8, points: 23 } },
    'ALG': { id: 'ALG', name: 'Algeria', shortName: 'ALG', flag: '🇩🇿', founded: 1962, stadium: 'Stade 5 Juillet 1962', capacity: 64000, manager: 'Djamel Belmadi', ranking: 33, group: 'Group J', players: [], league: 'Ligue 1', country: 'Algeria', stats: { played: 10, won: 4, drawn: 2, lost: 4, goalsFor: 11, goalsAgainst: 12, points: 14 } },
    'AUT': { id: 'AUT', name: 'Austria', shortName: 'AUT', flag: '🇦🇹', founded: 1904, stadium: 'Ernst Happel Stadion', capacity: 50000, manager: 'Ralf Rangnick', ranking: 36, group: 'Group J', players: [], league: 'Bundesliga', country: 'Austria', stats: { played: 10, won: 3, drawn: 3, lost: 4, goalsFor: 10, goalsAgainst: 13, points: 12 } },
    'JOR': { id: 'JOR', name: 'Jordan', shortName: 'JOR', flag: '🇯🇴', founded: 1949, stadium: 'Amman International Stadium', capacity: 25000, manager: 'Hussein Ammouta', ranking: 70, group: 'Group J', players: [], league: 'Jordan Pro League', country: 'Jordan', stats: { played: 10, won: 1, drawn: 3, lost: 6, goalsFor: 5, goalsAgainst: 17, points: 6 } },
    'POR': { id: 'POR', name: 'Portugal', shortName: 'POR', flag: '🇵🇹', founded: 1914, stadium: 'Estadio da Luz', capacity: 64000, manager: 'Roberto Martinez', ranking: 6, group: 'Group K', players: [], league: 'Primeira Liga', country: 'Portugal', stats: { played: 10, won: 6, drawn: 2, lost: 2, goalsFor: 18, goalsAgainst: 10, points: 20 } },
    'COD': { id: 'COD', name: 'DR Congo', shortName: 'COD', flag: '🇨🇩', founded: 1919, stadium: 'Stade des Martyrs', capacity: 80000, manager: 'Sebastien Desabre', ranking: 65, group: 'Group K', players: [], league: 'Linafoot', country: 'DR Congo', stats: { played: 10, won: 2, drawn: 3, lost: 5, goalsFor: 6, goalsAgainst: 14, points: 9 } },
    'UZB': { id: 'UZB', name: 'Uzbekistan', shortName: 'UZB', flag: '🇺🇿', founded: 1946, stadium: 'Bunyodkor Stadium', capacity: 34000, manager: 'Srecko Katanec', ranking: 68, group: 'Group K', players: [], league: 'Uzbek Super League', country: 'Uzbekistan', stats: { played: 10, won: 2, drawn: 2, lost: 6, goalsFor: 7, goalsAgainst: 16, points: 8 } },
    'COL': { id: 'COL', name: 'Colombia', shortName: 'COL', flag: '🇨🇴', founded: 1924, stadium: 'Estadio El Campin', capacity: 36000, manager: 'Nestor Lorenzo', ranking: 23, group: 'Group K', players: [], league: 'Categoría Primera A', country: 'Colombia', stats: { played: 10, won: 4, drawn: 3, lost: 3, goalsFor: 13, goalsAgainst: 10, points: 15 } },
    'ENG': { id: 'ENG', name: 'England', shortName: 'ENG', flag: '🏴', founded: 1863, stadium: 'Wembley Stadium', capacity: 90000, manager: 'Gareth Southgate', ranking: 4, group: 'Group L', players: [], league: 'Premier League', country: 'England', stats: { played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 22, goalsAgainst: 5, points: 23 } },
    'CRO': { id: 'CRO', name: 'Croatia', shortName: 'CRO', flag: '🇭🇷', founded: 1912, stadium: 'Stadion Maksimir', capacity: 44000, manager: 'Zlatko Dalic', ranking: 10, group: 'Group L', players: [], league: 'Croatian First Football League', country: 'Croatia', stats: { played: 10, won: 4, drawn: 4, lost: 2, goalsFor: 12, goalsAgainst: 8, points: 16 } },
    'GHA': { id: 'GHA', name: 'Ghana', shortName: 'GHA', flag: '🇬🇭', founded: 1957, stadium: 'Accra Sports Stadium', capacity: 40000, manager: 'Chris Hughton', ranking: 52, group: 'Group L', players: [], league: 'Ghana Premier League', country: 'Ghana', stats: { played: 10, won: 2, drawn: 3, lost: 5, goalsFor: 7, goalsAgainst: 14, points: 9 } },
    'PAN': { id: 'PAN', name: 'Panama', shortName: 'PAN', flag: '🇵🇦', founded: 1937, stadium: 'Estadio Rommel Fernandez', capacity: 32000, manager: 'Thomas Christiansen', ranking: 56, group: 'Group L', players: [], league: 'Liga Panamena', country: 'Panama', stats: { played: 10, won: 1, drawn: 4, lost: 5, goalsFor: 6, goalsAgainst: 14, points: 7 } },
  }

  return mockTeams[teamCode] || {
    id: teamCode,
    name: teamCode,
    shortName: teamCode,
    flag: '🏳️',
    founded: 1900,
    stadium: 'Stadium',
    capacity: 0,
    manager: 'TBD',
    ranking: 99,
    group: 'Group A',
    players: [],
    league: 'Unknown',
    country: 'Unknown',
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
  }
}

export function getMockAllTeams(): TeamStats[] {
  // All 48 teams from Groups A through L
  const teamCodes = [
    // Group A
    'MEX', 'KOR', 'CZE', 'RSA',
    // Group B
    'CAN', 'BIH', 'QAT', 'SUI',
    // Group C
    'BRA', 'MAR', 'HAI', 'SCO',
    // Group D
    'USA', 'PAR', 'AUS', 'TUR',
    // Group E
    'GER', 'CUW', 'ECU', 'CIV',
    // Group F
    'NED', 'JPN', 'SWE', 'TUN',
    // Group G
    'BEL', 'EGY', 'IRN', 'NZL',
    // Group H
    'ESP', 'CPV', 'KSA', 'URU',
    // Group I
    'FRA', 'SEN', 'IRQ', 'NOR',
    // Group J
    'ARG', 'ALG', 'AUT', 'JOR',
    // Group K
    'POR', 'COD', 'UZB', 'COL',
    // Group L
    'ENG', 'CRO', 'GHA', 'PAN',
  ]
  return teamCodes.map(code => getMockTeamStats(code))
}

export async function fetchTeamHeadToHead(homeTeamId: string, awayTeamId: string): Promise<{
  totalMatches: number
  homeWins: number
  draws: number
  awayWins: number
  recentMatches: Array<{ date: string; homeTeam: string; awayTeam: string; score: string }>
}> {
  const data = await fetchFromFootballData(`/teams/${homeTeamId}/matches?limit=10`)

  if (!data?.matches) {
    return {
      totalMatches: 5,
      homeWins: 2,
      draws: 1,
      awayWins: 2,
      recentMatches: [
        { date: '2022-12-09', homeTeam: 'ARG', awayTeam: 'NED', score: '2-2' },
        { date: '2022-11-22', homeTeam: 'ARG', awayTeam: 'KSA', score: '1-2' },
        { date: '2022-10-10', homeTeam: 'ARG', awayTeam: 'JAM', score: '3-0' },
      ]
    }
  }

  const matches = data.matches.filter((m: FootballDataMatch) =>
    (m.homeTeam.tla === homeTeamId && m.awayTeam.tla === awayTeamId) ||
    (m.homeTeam.tla === awayTeamId && m.awayTeam.tla === homeTeamId)
  )

  let homeWins = 0, draws = 0, awayWins = 0

  matches.forEach((m: FootballDataMatch) => {
    const isHome = m.homeTeam.tla === homeTeamId
    const homeGoals = m.score.fullTime.home
    const awayGoals = m.score.fullTime.away

    if (homeGoals === awayGoals) draws++
    else if ((isHome && homeGoals > awayGoals) || (!isHome && awayGoals > homeGoals)) homeWins++
    else awayWins++
  })

  return {
    totalMatches: matches.length || 5,
    homeWins: homeWins || 2,
    draws: draws || 1,
    awayWins: awayWins || 2,
    recentMatches: matches.slice(0, 5).map((m: FootballDataMatch) => ({
      date: m.utcDate.split('T')[0],
      homeTeam: m.homeTeam.tla || m.homeTeam.shortName,
      awayTeam: m.awayTeam.tla || m.awayTeam.shortName,
      score: `${m.score.fullTime.home}-${m.score.fullTime.away}`
    }))
  }
}
