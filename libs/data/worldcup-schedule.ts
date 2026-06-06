/**
 * Shared World Cup 2026 schedule data
 * Single source of truth for group stage and knockout matches
 */

export interface StaticMatch {
  team1: string
  team2: string
  date: string
  time: string
  venue: string
  day?: string
}

export const teamFlags: Record<string, string> = {
  'MEX': '🇲🇽', 'KOR': '🇰🇷', 'CZE': '🇨🇿', 'RSA': '🇿🇦',
  'CAN': '🇨🇦', 'BIH': '🇧🇦', 'QAT': '🇶🇦', 'SUI': '🇨🇭',
  'BRA': '🇧🇷', 'MAR': '🇲🇦', 'HAI': '🇭🇹', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸', 'PAR': '🇵🇾', 'AUS': '🇦🇺', 'TUR': '🇹🇷',
  'GER': '🇩🇪', 'CUW': '🇨🇼', 'ECU': '🇪🇨', 'CIV': '🇨🇮',
  'NED': '🇳🇱', 'JPN': '🇯🇵', 'SWE': '🇸🇪', 'TUN': '🇹🇳',
  'BEL': '🇧🇪', 'EGY': '🇪🇬', 'IRN': '🇮🇷', 'NZL': '🇳🇿',
  'ESP': '🇪🇸', 'CPV': '🇨🇻', 'KSA': '🇸🇦', 'URU': '🇺🇾',
  'FRA': '🇫🇷', 'SEN': '🇸🇳', 'IRQ': '🇮🇶', 'NOR': '🇳🇴',
  'ARG': '🇦🇷', 'ALG': '🇩🇿', 'AUT': '🇦🇹', 'JOR': '🇯🇴',
  'POR': '🇵🇹', 'COD': '🇨🇩', 'UZB': '🇺🇿', 'COL': '🇨🇴',
  'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'CRO': '🇭🇷', 'GHA': '🇬🇭', 'PAN': '🇵🇦',
  '1A': '🏆', '1B': '🏆', '1C': '🏆', '1D': '🏆', '1E': '🏆', '1F': '🏆', '1G': '🏆', '1H': '🏆',
  '1I': '🏆', '1J': '🏆', '1K': '🏆', '1L': '🏆',
  '2A': '🥈', '2B': '🥈', '2C': '🥈', '2D': '🥈', '2E': '🥈', '2F': '🥈', '2G': '🥈', '2H': '🥈',
  '2I': '🥈', '2J': '🥈', '2K': '🥈', '2L': '🥈',
  '3A': '⭐', '3B': '⭐', '3C': '⭐', '3D': '⭐',
  '3E': '⭐', '3F': '⭐', '3G': '⭐', '3H': '⭐',
  'W49': '⚽', 'W50': '⚽', 'W51': '⚽', 'W52': '⚽', 'W53': '⚽', 'W54': '⚽', 'W55': '⚽', 'W56': '⚽',
  'W57': '⚽', 'W58': '⚽', 'W59': '⚽', 'W60': '⚽',
  'W61': '⚽', 'W62': '⚽', 'W63': '⚽', 'W64': '⚽',
  'W65': '⚽', 'W66': '⚽', 'W67': '⚽', 'W68': '⚽',
  'W69': '🏆', 'W70': '🏆',
  'L69': '🥉', 'L70': '🥉',
}

function sortMatches(a: StaticMatch, b: StaticMatch): number {
  return new Date(`${a.date}T${a.time}:00`).getTime() - new Date(`${b.date}T${b.time}:00`).getTime()
}

export function getAllUpcomingMatches(): StaticMatch[] {
  const groups = Object.keys(GROUP_MATCHES)
  const all: StaticMatch[] = []
  for (const g of groups) {
    all.push(...(GROUP_MATCHES[g] || []))
  }
  all.sort(sortMatches)
  return all
}

const GROUP_MATCHES: Record<string, StaticMatch[]> = {
  'A': [
    { team1: 'MEX', team2: 'KOR', date: '2026-06-11', time: '16:00', venue: 'SoFi Stadium', day: 'Thu' },
    { team1: 'CZE', team2: 'RSA', date: '2026-06-11', time: '18:00', venue: 'MetLife Stadium', day: 'Thu' },
    { team1: 'MEX', team2: 'CZE', date: '2026-06-16', time: '18:00', venue: 'AT&T Stadium', day: 'Tue' },
    { team1: 'KOR', team2: 'RSA', date: '2026-06-17', time: '15:00', venue: 'NRG Stadium', day: 'Wed' },
    { team1: 'MEX', team2: 'RSA', date: '2026-06-21', time: '21:00', venue: 'Rose Bowl', day: 'Sun' },
    { team1: 'KOR', team2: 'CZE', date: '2026-06-22', time: '18:00', venue: 'Lincoln Financial Field', day: 'Mon' },
  ],
  'B': [
    { team1: 'CAN', team2: 'BIH', date: '2026-06-12', time: '18:00', venue: "Levi's Stadium", day: 'Fri' },
    { team1: 'QAT', team2: 'SUI', date: '2026-06-12', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Fri' },
    { team1: 'CAN', team2: 'QAT', date: '2026-06-17', time: '18:00', venue: 'SoFi Stadium', day: 'Wed' },
    { team1: 'BIH', team2: 'SUI', date: '2026-06-18', time: '15:00', venue: 'MetLife Stadium', day: 'Thu' },
    { team1: 'CAN', team2: 'SUI', date: '2026-06-22', time: '21:00', venue: 'Rose Bowl', day: 'Mon' },
    { team1: 'BIH', team2: 'QAT', date: '2026-06-23', time: '15:00', venue: 'NRG Stadium', day: 'Tue' },
  ],
  'C': [
    { team1: 'BRA', team2: 'MAR', date: '2026-06-13', time: '20:00', venue: 'AT&T Stadium', day: 'Sat' },
    { team1: 'HAI', team2: 'SCO', date: '2026-06-13', time: '18:00', venue: 'Lincoln Financial Field', day: 'Sat' },
    { team1: 'BRA', team2: 'HAI', date: '2026-06-18', time: '18:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
    { team1: 'MAR', team2: 'SCO', date: '2026-06-19', time: '15:00', venue: 'SoFi Stadium', day: 'Fri' },
    { team1: 'BRA', team2: 'SCO', date: '2026-06-23', time: '18:00', venue: "Levi's Stadium", day: 'Tue' },
    { team1: 'MAR', team2: 'HAI', date: '2026-06-24', time: '15:00', venue: 'MetLife Stadium', day: 'Wed' },
  ],
  'D': [
    { team1: 'USA', team2: 'PAR', date: '2026-06-12', time: '20:00', venue: 'SoFi Stadium', day: 'Fri' },
    { team1: 'AUS', team2: 'TUR', date: '2026-06-14', time: '18:00', venue: "Levi's Stadium", day: 'Sun' },
    { team1: 'USA', team2: 'AUS', date: '2026-06-18', time: '21:00', venue: 'NRG Stadium', day: 'Thu' },
    { team1: 'PAR', team2: 'TUR', date: '2026-06-19', time: '21:00', venue: 'AT&T Stadium', day: 'Fri' },
    { team1: 'USA', team2: 'TUR', date: '2026-06-23', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Tue' },
    { team1: 'PAR', team2: 'AUS', date: '2026-06-24', time: '18:00', venue: 'Rose Bowl', day: 'Wed' },
  ],
  'E': [
    { team1: 'GER', team2: 'CUW', date: '2026-06-14', time: '21:00', venue: 'MetLife Stadium', day: 'Sun' },
    { team1: 'ECU', team2: 'CIV', date: '2026-06-15', time: '18:00', venue: 'Lincoln Financial Field', day: 'Mon' },
    { team1: 'GER', team2: 'ECU', date: '2026-06-19', time: '18:00', venue: 'NRG Stadium', day: 'Fri' },
    { team1: 'CUW', team2: 'CIV', date: '2026-06-20', time: '15:00', venue: 'SoFi Stadium', day: 'Sat' },
    { team1: 'GER', team2: 'CIV', date: '2026-06-24', time: '21:00', venue: 'AT&T Stadium', day: 'Wed' },
    { team1: 'CUW', team2: 'ECU', date: '2026-06-25', time: '15:00', venue: "Levi's Stadium", day: 'Thu' },
  ],
  'F': [
    { team1: 'NED', team2: 'JPN', date: '2026-06-14', time: '18:00', venue: 'Rose Bowl', day: 'Sun' },
    { team1: 'SWE', team2: 'TUN', date: '2026-06-15', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Mon' },
    { team1: 'NED', team2: 'SWE', date: '2026-06-20', time: '18:00', venue: 'AT&T Stadium', day: 'Sat' },
    { team1: 'JPN', team2: 'TUN', date: '2026-06-21', time: '15:00', venue: 'Lincoln Financial Field', day: 'Sun' },
    { team1: 'NED', team2: 'TUN', date: '2026-06-25', time: '18:00', venue: 'MetLife Stadium', day: 'Thu' },
    { team1: 'JPN', team2: 'SWE', date: '2026-06-26', time: '15:00', venue: 'SoFi Stadium', day: 'Fri' },
  ],
  'G': [
    { team1: 'BEL', team2: 'EGY', date: '2026-06-15', time: '15:00', venue: 'NRG Stadium', day: 'Mon' },
    { team1: 'IRN', team2: 'NZL', date: '2026-06-16', time: '18:00', venue: 'Rose Bowl', day: 'Tue' },
    { team1: 'BEL', team2: 'IRN', date: '2026-06-20', time: '21:00', venue: "Levi's Stadium", day: 'Sat' },
    { team1: 'EGY', team2: 'NZL', date: '2026-06-21', time: '18:00', venue: 'MetLife Stadium', day: 'Sun' },
    { team1: 'BEL', team2: 'NZL', date: '2026-06-25', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
    { team1: 'EGY', team2: 'IRN', date: '2026-06-26', time: '18:00', venue: 'AT&T Stadium', day: 'Fri' },
  ],
  'H': [
    { team1: 'ESP', team2: 'CPV', date: '2026-06-13', time: '15:00', venue: 'AT&T Stadium', day: 'Sat' },
    { team1: 'KSA', team2: 'URU', date: '2026-06-14', time: '15:00', venue: 'NRG Stadium', day: 'Sun' },
    { team1: 'ESP', team2: 'KSA', date: '2026-06-18', time: '15:00', venue: 'MetLife Stadium', day: 'Thu' },
    { team1: 'CPV', team2: 'URU', date: '2026-06-19', time: '18:00', venue: 'Lincoln Financial Field', day: 'Fri' },
    { team1: 'ESP', team2: 'URU', date: '2026-06-23', time: '18:00', venue: 'SoFi Stadium', day: 'Tue' },
    { team1: 'CPV', team2: 'KSA', date: '2026-06-24', time: '15:00', venue: "Levi's Stadium", day: 'Wed' },
  ],
  'I': [
    { team1: 'FRA', team2: 'SEN', date: '2026-06-11', time: '21:00', venue: 'Rose Bowl', day: 'Thu' },
    { team1: 'IRQ', team2: 'NOR', date: '2026-06-12', time: '15:00', venue: "Levi's Stadium", day: 'Fri' },
    { team1: 'FRA', team2: 'IRQ', date: '2026-06-16', time: '15:00', venue: 'Mercedes-Benz Stadium', day: 'Tue' },
    { team1: 'SEN', team2: 'NOR', date: '2026-06-17', time: '21:00', venue: 'SoFi Stadium', day: 'Wed' },
    { team1: 'FRA', team2: 'NOR', date: '2026-06-21', time: '18:00', venue: 'AT&T Stadium', day: 'Sun' },
    { team1: 'SEN', team2: 'IRQ', date: '2026-06-22', time: '15:00', venue: 'NRG Stadium', day: 'Mon' },
  ],
  'J': [
    { team1: 'ARG', team2: 'ALG', date: '2026-06-11', time: '18:00', venue: 'Mercedes-Benz Stadium', day: 'Thu' },
    { team1: 'AUT', team2: 'JOR', date: '2026-06-12', time: '18:00', venue: 'AT&T Stadium', day: 'Fri' },
    { team1: 'ARG', team2: 'AUT', date: '2026-06-16', time: '21:00', venue: 'NRG Stadium', day: 'Tue' },
    { team1: 'ALG', team2: 'JOR', date: '2026-06-17', time: '18:00', venue: 'Lincoln Financial Field', day: 'Wed' },
    { team1: 'ARG', team2: 'JOR', date: '2026-06-22', time: '18:00', venue: 'MetLife Stadium', day: 'Mon' },
    { team1: 'ALG', team2: 'AUT', date: '2026-06-23', time: '15:00', venue: 'SoFi Stadium', day: 'Tue' },
  ],
  'K': [
    { team1: 'POR', team2: 'COD', date: '2026-06-13', time: '21:00', venue: 'NRG Stadium', day: 'Sat' },
    { team1: 'UZB', team2: 'COL', date: '2026-06-14', time: '15:00', venue: 'SoFi Stadium', day: 'Sun' },
    { team1: 'POR', team2: 'UZB', date: '2026-06-19', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Fri' },
    { team1: 'COD', team2: 'COL', date: '2026-06-20', time: '18:00', venue: 'NRG Stadium', day: 'Sat' },
    { team1: 'POR', team2: 'COL', date: '2026-06-24', time: '18:00', venue: 'MetLife Stadium', day: 'Wed' },
    { team1: 'COD', team2: 'UZB', date: '2026-06-25', time: '15:00', venue: 'Rose Bowl', day: 'Thu' },
  ],
  'L': [
    { team1: 'ENG', team2: 'CRO', date: '2026-06-11', time: '15:00', venue: 'AT&T Stadium', day: 'Thu' },
    { team1: 'GHA', team2: 'PAN', date: '2026-06-13', time: '15:00', venue: 'SoFi Stadium', day: 'Sat' },
    { team1: 'ENG', team2: 'GHA', date: '2026-06-17', time: '15:00', venue: 'Rose Bowl', day: 'Wed' },
    { team1: 'CRO', team2: 'PAN', date: '2026-06-18', time: '21:00', venue: 'AT&T Stadium', day: 'Thu' },
    { team1: 'ENG', team2: 'PAN', date: '2026-06-22', time: '21:00', venue: 'Mercedes-Benz Stadium', day: 'Mon' },
    { team1: 'CRO', team2: 'GHA', date: '2026-06-23', time: '18:00', venue: 'Lincoln Financial Field', day: 'Tue' },
  ],
}

const KNOCKOUT_MATCHES: Record<string, StaticMatch[]> = {
  'roundOf16': [
    { team1: '1A', team2: '2B', date: '2026-06-28', time: '16:00', venue: 'Mercedes-Benz Stadium' },
    { team1: '1C', team2: '2D', date: '2026-06-28', time: '19:00', venue: 'SoFi Stadium' },
    { team1: '1E', team2: '2F', date: '2026-06-28', time: '21:00', venue: 'AT&T Stadium' },
    { team1: '1G', team2: '2H', date: '2026-06-29', time: '16:00', venue: 'NRG Stadium' },
    { team1: '1I', team2: '2J', date: '2026-06-29', time: '19:00', venue: 'MetLife Stadium' },
    { team1: '1K', team2: '2L', date: '2026-06-29', time: '21:00', venue: "Levi's Stadium" },
    { team1: '1B', team2: '2A', date: '2026-06-30', time: '16:00', venue: 'Lincoln Financial Field' },
    { team1: '1D', team2: '2C', date: '2026-06-30', time: '19:00', venue: 'Rose Bowl' },
    { team1: '1F', team2: '2E', date: '2026-07-01', time: '16:00', venue: 'Hard Rock Stadium' },
    { team1: '1H', team2: '2G', date: '2026-07-01', time: '19:00', venue: 'US Bank Stadium' },
    { team1: '1J', team2: '2I', date: '2026-07-01', time: '21:00', venue: 'SoFi Stadium' },
    { team1: '1L', team2: '2K', date: '2026-07-02', time: '16:00', venue: 'Mercedes-Benz Stadium' },
    { team1: '3A', team2: '3B', date: '2026-07-02', time: '19:00', venue: 'AT&T Stadium' },
    { team1: '3C', team2: '3D', date: '2026-07-02', time: '21:00', venue: 'NRG Stadium' },
    { team1: '3E', team2: '3F', date: '2026-07-03', time: '16:00', venue: 'MetLife Stadium' },
    { team1: '3G', team2: '3H', date: '2026-07-03', time: '19:00', venue: "Levi's Stadium" },
  ],
  'quarterFinals': [
    { team1: 'W49', team2: 'W50', date: '2026-07-05', time: '16:00', venue: 'Mercedes-Benz Stadium' },
    { team1: 'W51', team2: 'W52', date: '2026-07-05', time: '19:00', venue: 'SoFi Stadium' },
    { team1: 'W53', team2: 'W54', date: '2026-07-06', time: '16:00', venue: 'AT&T Stadium' },
    { team1: 'W55', team2: 'W56', date: '2026-07-06', time: '19:00', venue: 'NRG Stadium' },
    { team1: 'W57', team2: 'W58', date: '2026-07-07', time: '16:00', venue: 'MetLife Stadium' },
    { team1: 'W59', team2: 'W60', date: '2026-07-07', time: '19:00', venue: 'SoFi Stadium' },
    { team1: 'W61', team2: 'W62', date: '2026-07-08', time: '16:00', venue: 'Rose Bowl' },
    { team1: 'W63', team2: 'W64', date: '2026-07-08', time: '19:00', venue: 'Lincoln Financial Field' },
  ],
  'semiFinals': [
    { team1: 'W65', team2: 'W66', date: '2026-07-11', time: '18:00', venue: 'MetLife Stadium' },
    { team1: 'W67', team2: 'W68', date: '2026-07-12', time: '18:00', venue: 'SoFi Stadium' },
  ],
  'final': [
    { team1: 'W69', team2: 'W70', date: '2026-07-19', time: '18:00', venue: 'Hard Rock Stadium' },
  ],
  'thirdPlace': [
    { team1: 'L69', team2: 'L70', date: '2026-07-18', time: '16:00', venue: 'Mercedes-Benz Stadium' },
  ],
}

export function getGroupMatches(group: string): StaticMatch[] {
  return GROUP_MATCHES[group] || []
}

export function getKnockoutMatches(stage: string): StaticMatch[] {
  return KNOCKOUT_MATCHES[stage] || []
}
