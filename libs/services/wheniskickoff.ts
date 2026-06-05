import { Match, Team } from '../types'

let cheerio: any = null

async function getCheerio() {
  if (!cheerio) {
    const module = await import('cheerio')
    cheerio = module.default
  }
  return cheerio
}

const WORLD_CUP_2026_TEAMS: Team[] = [
  // Group A (4 teams)
  { id: 'MEX', name: 'Mexico', shortName: 'MEX', flag: '🇲🇽', group: 'Group A' },
  { id: 'KOR', name: 'South Korea', shortName: 'KOR', flag: '🇰🇷', group: 'Group A' },
  { id: 'CZE', name: 'Czech Republic', shortName: 'CZE', flag: '🇨🇿', group: 'Group A' },
  { id: 'RSA', name: 'South Africa', shortName: 'RSA', flag: '🇿🇦', group: 'Group A' },

  // Group B (4 teams)
  { id: 'CAN', name: 'Canada', shortName: 'CAN', flag: '🇨🇦', group: 'Group B' },
  { id: 'BIH', name: 'Bosnia and Herzegovina', shortName: 'BIH', flag: '🇧🇦', group: 'Group B' },
  { id: 'QAT', name: 'Qatar', shortName: 'QAT', flag: '🇶🇦', group: 'Group B' },
  { id: 'SUI', name: 'Switzerland', shortName: 'SUI', flag: '🇨🇭', group: 'Group B' },

  // Group C (4 teams)
  { id: 'BRA', name: 'Brazil', shortName: 'BRA', flag: '🇧🇷', group: 'Group C' },
  { id: 'MAR', name: 'Morocco', shortName: 'MAR', flag: '🇲🇦', group: 'Group C' },
  { id: 'HAI', name: 'Haiti', shortName: 'HAI', flag: '🇭🇹', group: 'Group C' },
  { id: 'SCO', name: 'Scotland', shortName: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'Group C' },

  // Group D (4 teams)
  { id: 'USA', name: 'United States', shortName: 'USA', flag: '🇺🇸', group: 'Group D' },
  { id: 'PAR', name: 'Paraguay', shortName: 'PAR', flag: '🇵🇾', group: 'Group D' },
  { id: 'AUS', name: 'Australia', shortName: 'AUS', flag: '🇦🇺', group: 'Group D' },
  { id: 'TUR', name: 'Turkey', shortName: 'TUR', flag: '🇹🇷', group: 'Group D' },

  // Group E (4 teams)
  { id: 'GER', name: 'Germany', shortName: 'GER', flag: '🇩🇪', group: 'Group E' },
  { id: 'CUW', name: 'Curacao', shortName: 'CUW', flag: '🇨🇼', group: 'Group E' },
  { id: 'ECU', name: 'Ecuador', shortName: 'ECU', flag: '🇪🇨', group: 'Group E' },
  { id: 'CIV', name: 'Ivory Coast', shortName: 'CIV', flag: '🇨🇮', group: 'Group E' },

  // Group F (4 teams)
  { id: 'NED', name: 'Netherlands', shortName: 'NED', flag: '🇳🇱', group: 'Group F' },
  { id: 'JPN', name: 'Japan', shortName: 'JPN', flag: '🇯🇵', group: 'Group F' },
  { id: 'SWE', name: 'Sweden', shortName: 'SWE', flag: '🇸🇪', group: 'Group F' },
  { id: 'TUN', name: 'Tunisia', shortName: 'TUN', flag: '🇹🇳', group: 'Group F' },

  // Group G (4 teams)
  { id: 'BEL', name: 'Belgium', shortName: 'BEL', flag: '🇧🇪', group: 'Group G' },
  { id: 'EGY', name: 'Egypt', shortName: 'EGY', flag: '🇪🇬', group: 'Group G' },
  { id: 'IRN', name: 'Iran', shortName: 'IRN', flag: '🇮🇷', group: 'Group G' },
  { id: 'NZL', name: 'New Zealand', shortName: 'NZL', flag: '🇳🇿', group: 'Group G' },

  // Group H (4 teams)
  { id: 'ESP', name: 'Spain', shortName: 'ESP', flag: '🇪🇸', group: 'Group H' },
  { id: 'CPV', name: 'Cape Verde', shortName: 'CPV', flag: '🇨🇻', group: 'Group H' },
  { id: 'KSA', name: 'Saudi Arabia', shortName: 'KSA', flag: '🇸🇦', group: 'Group H' },
  { id: 'URU', name: 'Uruguay', shortName: 'URU', flag: '🇺🇾', group: 'Group H' },

  // Group I (4 teams)
  { id: 'FRA', name: 'France', shortName: 'FRA', flag: '🇫🇷', group: 'Group I' },
  { id: 'SEN', name: 'Senegal', shortName: 'SEN', flag: '🇸🇳', group: 'Group I' },
  { id: 'IRQ', name: 'Iraq', shortName: 'IRQ', flag: '🇮🇶', group: 'Group I' },
  { id: 'NOR', name: 'Norway', shortName: 'NOR', flag: '🇳🇴', group: 'Group I' },

  // Group J (4 teams)
  { id: 'ARG', name: 'Argentina', shortName: 'ARG', flag: '🇦🇷', group: 'Group J' },
  { id: 'ALG', name: 'Algeria', shortName: 'ALG', flag: '🇩🇿', group: 'Group J' },
  { id: 'AUT', name: 'Austria', shortName: 'AUT', flag: '🇦🇹', group: 'Group J' },
  { id: 'JOR', name: 'Jordan', shortName: 'JOR', flag: '🇯🇴', group: 'Group J' },

  // Group K (4 teams)
  { id: 'POR', name: 'Portugal', shortName: 'POR', flag: '🇵🇹', group: 'Group K' },
  { id: 'COD', name: 'DR Congo', shortName: 'COD', flag: '🇨🇩', group: 'Group K' },
  { id: 'UZB', name: 'Uzbekistan', shortName: 'UZB', flag: '🇺🇿', group: 'Group K' },
  { id: 'COL', name: 'Colombia', shortName: 'COL', flag: '🇨🇴', group: 'Group K' },

  // Group L (4 teams)
  { id: 'ENG', name: 'England', shortName: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'Group L' },
  { id: 'CRO', name: 'Croatia', shortName: 'CRO', flag: '🇭🇷', group: 'Group L' },
  { id: 'GHA', name: 'Ghana', shortName: 'GHA', flag: '🇬🇭', group: 'Group L' },
  { id: 'PAN', name: 'Panama', shortName: 'PAN', flag: '🇵🇦', group: 'Group L' },
]

const TEAM_FLAGS: Record<string, string> = {
  'argentina': '🇦🇷', 'brazil': '🇧🇷', 'canada': '🇨🇦', 'mexico': '🇲🇽',
  'france': '🇫🇷', 'portugal': '🇵🇹', 'usa': '🇺🇸', 'united states': '🇺🇸', 'panama': '🇵🇦',
  'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'spain': '🇪🇸', 'germany': '🇩🇪', 'japan': '🇯🇵',
  'belgium': '🇧🇪', 'netherlands': '🇳🇱', 'costa rica': '🇨🇷',
  'uruguay': '🇺🇾', 'colombia': '🇨🇴', 'ecuador': '🇪🇨', 'paraguay': '🇵🇾',
  'croatia': '🇭🇷', 'morocco': '🇲🇦', 'australia': '🇦🇺', 'new zealand': '🇳🇿',
  'senegal': '🇸🇳', 'korea': '🇰🇷', 'south korea': '🇰🇷', 'iran': '🇮🇷',
  'ghana': '🇬🇭', 'saudi arabia': '🇸🇦', 'switzerland': '🇨🇭',
  'sweden': '🇸🇪', 'turkey': '🇹🇷', 'austria': '🇦🇹',
  'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'tunisia': '🇹🇳', 'algeria': '🇩🇿',
  'uzbekistan': '🇺🇿', 'qatar': '🇶🇦', 'norway': '🇳🇴',
  'czech republic': '🇨🇿', 'egypt': '🇪🇬', 'south africa': '🇿🇦',
  'bosnia': '🇧🇦', 'bosnia and herzegovina': '🇧🇦', 'cape verde': '🇨🇻',
  'curacao': '🇨🇼', 'ivory coast': '🇨🇮', 'dr congo': '🇨🇩',
  'haiti': '🇭🇹', 'iraq': '🇮🇶', 'jordan': '🇯🇴',
}

const VENUES = [
  'MetLife Stadium, New Jersey, USA',
  'Rose Bowl, California, USA',
  'AT&T Stadium, Texas, USA',
  'Lambeau Field, Wisconsin, USA',
  "Levi's Stadium, California, USA",
  'Lincoln Financial Field, Philadelphia, USA',
  'NRG Stadium, Texas, USA',
  'Lamar Hunt U.S. Open Cup Final',
  'SoFi Stadium, California, USA',
  'Arrowhead Stadium, Missouri, USA',
]

function getTeamFlag(teamName: string): string {
  const lower = teamName.toLowerCase()
  for (const [key, flag] of Object.entries(TEAM_FLAGS)) {
    if (lower.includes(key)) {
      return flag
    }
  }
  return '🏳️'
}

function getTeamByName(name: string): Team {
  const lower = name.toLowerCase()
  for (const team of WORLD_CUP_2026_TEAMS) {
    if (lower.includes(team.name.toLowerCase()) || lower.includes(team.shortName.toLowerCase())) {
      return team
    }
  }
  return {
    id: name.substring(0, 3).toUpperCase(),
    name: name,
    shortName: name.substring(0, 3).toUpperCase(),
    flag: getTeamFlag(name),
    group: 'Group A'
  }
}

export async function fetchMatchSchedule(): Promise<Match[]> {
  try {
    const response = await fetch('https://wheniskickoff.com/world-cup-2026-match-schedule', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      console.warn(`Failed to fetch: ${response.status}, using mock data`)
      return getMockMatchSchedule()
    }

    const html = await response.text()
    return await parseMatchScheduleFromHTML(html)
  } catch (error) {
    console.error('Failed to fetch match schedule:', error)
    return getMockMatchSchedule()
  }
}

async function parseMatchScheduleFromHTML(html: string): Promise<Match[]> {
  const { load } = await getCheerio()
  const $ = load(html)
  const matches: Match[] = []

  $('table, div[class*="match"], div[class*="schedule"], article').each((_: number, element: any) => {
    const text = $(element).text()

    const dateMatch = text.match(/(\w+\s+\d{1,2},\s+\d{4})|(\d{1,2}\s+\w+\s+\d{4})/)
    const teamMatches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:vs|vs\.|\-)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g)

    if (dateMatch && teamMatches) {
      const teams = teamMatches[0].split(/\s+(?:vs|vs\.|\-)\s+/)
      if (teams.length === 2) {
        const homeTeam = getTeamByName(teams[0].trim())
        const awayTeam = getTeamByName(teams[1].trim())
        const groupLetter = String.fromCharCode(65 + (matches.length % 12))

        matches.push({
          id: `wc2026-match-${matches.length + 1}`,
          homeTeam,
          awayTeam,
          date: formatDate(dateMatch[0]),
          time: extractTime(text) || '12:00',
          venue: VENUES[matches.length % VENUES.length],
          group: `Group ${groupLetter}`,
          status: 'scheduled',
          round: matches.length < 36 ? 'Group Stage' : matches.length < 48 ? 'Round of 16' : 'Quarter Finals'
        })
      }
    }
  })

  if (matches.length === 0) {
    console.warn('No matches parsed from HTML, using mock data')
    return getMockMatchSchedule()
  }

  return matches
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return new Date('2026-06-11').toISOString().split('T')[0]
    }
    return date.toISOString().split('T')[0]
  } catch {
    return '2026-06-11'
  }
}

function extractTime(text: string): string | undefined {
  const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (timeMatch) {
    let hours = parseInt(timeMatch[1])
    const minutes = timeMatch[2]
    const period = timeMatch[3]?.toUpperCase()

    if (period === 'PM' && hours < 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }
  return undefined
}

export async function fetchLiveScores(): Promise<Match[]> {
  try {
    const response = await fetch('https://wheniskickoff.com/world-cup-2026-live-scores', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      return []
    }

    const html = await response.text()
    return await parseLiveScoresFromHTML(html)
  } catch (error) {
    console.error('Failed to fetch live scores:', error)
    return []
  }
}

async function parseLiveScoresFromHTML(html: string): Promise<Match[]> {
  const { load } = await getCheerio()
  const $ = load(html)
  const liveMatches: Match[] = []

  $('[class*="live"], [class*="score"], [class*="result"]').each((_: number, element: any) => {
    const text = $(element).text()

    if (text.includes('vs') && /\d+\s*-\s*\d+/.test(text)) {
      const teams = text.split(/\d+\s*-\s*\d+/)[0].split(/\s+vs\s+/)
      const scores = text.match(/(\d+)\s*-\s*(\d+)/)

      if (teams.length === 2 && scores) {
        const homeTeam = getTeamByName(teams[0].trim())
        const awayTeam = getTeamByName(teams[1].trim())

        liveMatches.push({
          id: `live-${Date.now()}-${Math.random()}`,
          homeTeam,
          awayTeam,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
          venue: 'Live Stadium',
          group: 'Live',
          status: 'live',
          score: {
            home: parseInt(scores[1]),
            away: parseInt(scores[2])
          },
          round: 'Live'
        })
      }
    }
  })

  return liveMatches
}

export function getMockMatchSchedule(): Match[] {
  const matches: Match[] = []
  const baseDate = new Date('2026-06-11')

  const groupLetters = 'ABCDEFGHIJKL'.split('')
  const groupMatchesPerTeam = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ]

  for (let groupIdx = 0; groupIdx < 12; groupIdx++) {
    const groupLetter = groupLetters[groupIdx]
    const groupTeams = WORLD_CUP_2026_TEAMS.filter(t => t.group === `Group ${groupLetter}`)
    
    for (let matchIdx = 0; matchIdx < groupMatchesPerTeam.length; matchIdx++) {
      const [i1, i2] = groupMatchesPerTeam[matchIdx]
      const team1 = groupTeams[i1]
      const team2 = groupTeams[i2]
      
      const matchDate = new Date(baseDate)
      matchDate.setDate(matchDate.getDate() + Math.floor((groupIdx * 6 + matchIdx) / 2))

      matches.push({
        id: `wc2026-match-${matches.length + 1}`,
        homeTeam: team1,
        awayTeam: team2,
        date: matchDate.toISOString().split('T')[0],
        time: `${12 + (matches.length % 6)}:00`,
        venue: VENUES[matches.length % VENUES.length],
        group: `Group ${groupLetter}`,
        status: matches.length < 12 ? 'finished' : matches.length < 24 ? 'live' : 'scheduled',
        score: matches.length < 12 ? {
          home: Math.floor(Math.random() * 4),
          away: Math.floor(Math.random() * 4)
        } : matches.length < 24 ? {
          home: Math.floor(Math.random() * 2),
          away: Math.floor(Math.random() * 2)
        } : undefined,
        round: 'Group Stage'
      })
    }
  }

  return matches
}

export function getTeams(): Team[] {
  return WORLD_CUP_2026_TEAMS
}

export function getTeamById(id: string): Team | undefined {
  return WORLD_CUP_2026_TEAMS.find(t => t.id === id || t.shortName === id)
}

export function getUpcomingMatches(matches: Match[], limit: number = 5): Match[] {
  return matches
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit)
}

export function getFinishedMatches(matches: Match[], limit: number = 5): Match[] {
  return matches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function getMatchesByGroup(matches: Match[], group: string): Match[] {
  return matches.filter(m => m.group === group)
}

export function getMatchesByTeam(matches: Match[], teamId: string): Match[] {
  return matches.filter(m =>
    m.homeTeam.id === teamId || m.awayTeam.id === teamId
  )
}
