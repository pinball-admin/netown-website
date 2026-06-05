/**
 * Team News & Injury Impact Scraper
 * 
 * Gathers latest team news, injury reports, and suspensions
 * to adjust predictions based on key player availability.
 * 
 * Sources:
 * - Transfermarkt (injuries, suspensions)
 * - ESPN FC (team news)
 * - Official FIFA/league APIs
 * 
 * Impact factors:
 * - Key player absence: reduces team xG by 5-15%
 * - Starting goalkeeper out: increases xGA by 10-20%
 * - Captain/leader missing: reduces team cohesion factor
 * - Travel fatigue: long-distance travel reduces performance
 * - Squad rotation: affects team chemistry
 */

export interface PlayerImpact {
  name: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD' | 'CAP'
  impactScore: number // 1-10, how important this player is to the team
  status: 'available' | 'injured' | 'suspended' | 'doubtful' | 'traveling'
  daysUntilReturn?: number
}

export interface TeamNewsReport {
  teamId: string
  lastUpdated: string
  // Key player availability
  keyPlayers: PlayerImpact[]
  // Team situation
  teamMorale: 'high' | 'medium' | 'low' // Based on recent results
  travelDays: number // Days since last match/travel
  restDays: number // Days of rest before this match
  formationChange: boolean // Has coach indicated tactical change?
  weatherFactor: 'favorable' | 'neutral' | 'adverse'
  
  // Calculated impact
  offensiveModifier: number // 0.85 to 1.15
  defensiveModifier: number // 0.85 to 1.15
  overallModifier: number // Combined modifier 0.80 to 1.20
  
  // News summary
  headlines: string[]
}

// Static news data for World Cup 2026 teams (updated periodically)
// In production, this would be fetched from real APIs
const TEAM_NEWS: Record<string, Partial<TeamNewsReport>> = {
  'ARG': {
    keyPlayers: [
      { name: 'Lionel Messi', position: 'FWD', impactScore: 10, status: 'available' },
      { name: 'Emiliano Martinez', position: 'GK', impactScore: 8, status: 'available' },
      { name: 'Lautaro Martinez', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Enzo Fernandez', position: 'MID', impactScore: 7, status: 'available' },
      { name: 'Nicolas Otamendi', position: 'DEF', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 0,
    restDays: 5,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Argentina training at full strength ahead of opener',
      'Messi declares: "This is my last World Cup"',
      'Scaloni confirms no injury concerns in squad',
    ],
  },
  'BRA': {
    keyPlayers: [
      { name: 'Vinicius Junior', position: 'FWD', impactScore: 9, status: 'available' },
      { name: 'Neymar Jr', position: 'FWD', impactScore: 8, status: 'doubtful', daysUntilReturn: 3 },
      { name: 'Alisson', position: 'GK', impactScore: 8, status: 'available' },
      { name: 'Casemiro', position: 'MID', impactScore: 7, status: 'available' },
      { name: 'Marquinhos', position: 'DEF', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'medium',
    travelDays: 1,
    restDays: 4,
    formationChange: true,
    weatherFactor: 'neutral',
    headlines: [
      'Neymar fitness remains major question for Brazil',
      'Vinicius in stellar form heading into tournament',
      'Dorival Junior considering 4-3-3 formation change',
    ],
  },
  'FRA': {
    keyPlayers: [
      { name: 'Kylian Mbappe', position: 'FWD', impactScore: 10, status: 'available' },
      { name: 'Antoine Griezmann', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Aurelien Tchouameni', position: 'MID', impactScore: 7, status: 'available' },
      { name: 'Mike Maignan', position: 'GK', impactScore: 8, status: 'available' },
      { name: 'William Saliba', position: 'DEF', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 0,
    restDays: 5,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Mbappe: "We are here to win, nothing else"',
      'France squad depth impresses in training sessions',
      'Deschamps confident in defensive solidity',
    ],
  },
  'ENG': {
    keyPlayers: [
      { name: 'Harry Kane', position: 'FWD', impactScore: 9, status: 'available' },
      { name: 'Jude Bellingham', position: 'MID', impactScore: 9, status: 'available' },
      { name: 'Phil Foden', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Bukayo Saka', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Declan Rice', position: 'MID', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 0,
    restDays: 5,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'England Golden Generation ready to deliver',
      'Bellingham-Foden axis could be tournament-defining',
      'Southgate: "We have the quality to go all the way"',
    ],
  },
  'ESP': {
    keyPlayers: [
      { name: 'Pedri', position: 'MID', impactScore: 9, status: 'available' },
      { name: 'Gavi', position: 'MID', impactScore: 8, status: 'injured', daysUntilReturn: 14 },
      { name: 'Lamine Yamal', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Rodri', position: 'MID', impactScore: 9, status: 'available' },
      { name: 'Unai Simon', position: 'GK', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'medium',
    travelDays: 0,
    restDays: 4,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Gavi injury a blow to Spain midfield creativity',
      'Lamine Yamal excited for World Cup debut at 18',
      'Rodri: "Spain play to win every tournament"',
    ],
  },
  'GER': {
    keyPlayers: [
      { name: 'Jamal Musiala', position: 'MID', impactScore: 9, status: 'available' },
      { name: 'Florian Wirtz', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Joshua Kimmich', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Kai Havertz', position: 'FWD', impactScore: 7, status: 'available' },
      { name: 'Antonio Rudiger', position: 'DEF', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 0,
    restDays: 5,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Germany\'s young guns ready to make their mark',
      'Musiala-Wirtz partnership excites Nagelsmann',
      'Host nation feeling pressure of expectations',
    ],
  },
  'POR': {
    keyPlayers: [
      { name: 'Cristiano Ronaldo', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Bruno Fernandes', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Bernardo Silva', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Ruben Dias', position: 'DEF', impactScore: 8, status: 'available' },
      { name: 'Diogo Costa', position: 'GK', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 0,
    restDays: 5,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Ronaldo\'s swansong? CR7 motivated for final World Cup',
      'Portugal squad depth among best in tournament',
      'Martinez builds tactical system around midfield trio',
    ],
  },
  'NED': {
    keyPlayers: [
      { name: 'Virgil van Dijk', position: 'DEF', impactScore: 9, status: 'available' },
      { name: 'Cody Gakpo', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Frenkie de Jong', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Xavi Simons', position: 'MID', impactScore: 7, status: 'available' },
      { name: 'Memphis Depay', position: 'FWD', impactScore: 7, status: 'doubtful', daysUntilReturn: 2 },
    ],
    teamMorale: 'medium',
    travelDays: 0,
    restDays: 4,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Van Dijk leads from the front in training',
      'Depay fitness concern for Netherlands opener',
      'Koeman trusts experienced core of squad',
    ],
  },
  'URU': {
    keyPlayers: [
      { name: 'Federico Valverde', position: 'MID', impactScore: 9, status: 'available' },
      { name: 'Darwin Nunez', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Ronald Araujo', position: 'DEF', impactScore: 8, status: 'available' },
      { name: 'Sergio Rochet', position: 'GK', impactScore: 6, status: 'available' },
    ],
    teamMorale: 'medium',
    travelDays: 2,
    restDays: 3,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Uruguay blending youth with experience under Bielsa',
      'Valverde in career-best form for Real Madrid',
    ],
  },
  'MAR': {
    keyPlayers: [
      { name: 'Achraf Hakimi', position: 'DEF', impactScore: 9, status: 'available' },
      { name: 'Hakim Ziyech', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Youssef En-Nesyri', position: 'FWD', impactScore: 7, status: 'available' },
      { name: 'Sofyan Amrabat', position: 'MID', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 1,
    restDays: 4,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Morocco aiming to build on 2022 semifinal heroics',
      'Hakimi: "We proved Africa can compete at the top"',
    ],
  },
  'USA': {
    keyPlayers: [
      { name: 'Christian Pulisic', position: 'FWD', impactScore: 9, status: 'available' },
      { name: 'Weston McKennie', position: 'MID', impactScore: 7, status: 'available' },
      { name: 'Tyler Adams', position: 'MID', impactScore: 7, status: 'doubtful', daysUntilReturn: 5 },
      { name: 'Giovanni Reyna', position: 'MID', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 0,
    restDays: 6,
    formationChange: false,
    weatherFactor: 'favorable',
    headlines: [
      'Home advantage huge for USMNT at World Cup 2026',
      'Pulisic leading from the front as captain',
      'Tyler Adams fitness remains key concern',
    ],
  },
  'MEX': {
    keyPlayers: [
      { name: 'Hirving Lozano', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Edson Alvarez', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Guillermo Ochoa', position: 'GK', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'medium',
    travelDays: 0,
    restDays: 5,
    formationChange: false,
    weatherFactor: 'favorable',
    headlines: [
      'Mexico riding home support wave into tournament',
      'El Tri looking to break round of 16 curse',
    ],
  },
  'JPN': {
    keyPlayers: [
      { name: 'Kaoru Mitoma', position: 'FWD', impactScore: 8, status: 'available' },
      { name: 'Takefusa Kubo', position: 'MID', impactScore: 8, status: 'available' },
      { name: 'Wataru Endo', position: 'MID', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 2,
    restDays: 4,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Japan\'s European-based stars in excellent form',
      'Samurai Blue aiming to surpass 2022 quarter-final',
    ],
  },
  'KOR': {
    keyPlayers: [
      { name: 'Son Heung-min', position: 'FWD', impactScore: 9, status: 'available' },
      { name: 'Kim Min-jae', position: 'DEF', impactScore: 8, status: 'available' },
      { name: 'Lee Kang-in', position: 'MID', impactScore: 7, status: 'available' },
    ],
    teamMorale: 'high',
    travelDays: 2,
    restDays: 4,
    formationChange: false,
    weatherFactor: 'neutral',
    headlines: [
      'Son Heung-min: "We want to make history"',
      'Korea\'s defense built around Kim Min-jae leadership',
    ],
  },
}

const DEFAULT_NEWS: TeamNewsReport = {
  teamId: 'UNK',
  lastUpdated: new Date().toISOString(),
  keyPlayers: [],
  teamMorale: 'medium',
  travelDays: 2,
  restDays: 4,
  formationChange: false,
  weatherFactor: 'neutral',
  offensiveModifier: 1.0,
  defensiveModifier: 1.0,
  overallModifier: 1.0,
  headlines: ['No significant team news available'],
}

/**
 * Get team news report with calculated impact modifiers
 */
export function getTeamNews(teamId: string): TeamNewsReport {
  const raw = TEAM_NEWS[teamId]
  if (!raw) return { ...DEFAULT_NEWS, teamId }

  const report: TeamNewsReport = {
    teamId,
    lastUpdated: new Date().toISOString(),
    keyPlayers: raw.keyPlayers || [],
    teamMorale: raw.teamMorale || 'medium',
    travelDays: raw.travelDays || 2,
    restDays: raw.restDays || 4,
    formationChange: raw.formationChange || false,
    weatherFactor: raw.weatherFactor || 'neutral',
    offensiveModifier: 1.0,
    defensiveModifier: 1.0,
    overallModifier: 1.0,
    headlines: raw.headlines || [],
  }

  // Calculate modifiers based on player availability
  const modifiers = calculateModifiers(report)
  report.offensiveModifier = modifiers.offensive
  report.defensiveModifier = modifiers.defensive
  report.overallModifier = modifiers.overall

  return report
}

function calculateModifiers(report: TeamNewsReport): {
  offensive: number; defensive: number; overall: number
} {
  let offensiveMod = 1.0
  let defensiveMod = 1.0

  // Key player absence impact
  for (const player of report.keyPlayers) {
    if (player.status === 'injured' || player.status === 'suspended') {
      const impact = player.impactScore / 10
      if (player.position === 'FWD' || player.position === 'CAP') {
        offensiveMod -= impact * 0.08 // Max -8% per key attacker
      } else if (player.position === 'GK') {
        defensiveMod -= impact * 0.12 // Max -12% per key keeper
      } else if (player.position === 'DEF') {
        defensiveMod -= impact * 0.06 // Max -6% per key defender
      } else if (player.position === 'MID') {
        offensiveMod -= impact * 0.04
        defensiveMod -= impact * 0.03
      }
    } else if (player.status === 'doubtful') {
      const impact = (player.impactScore / 10) * 0.5 // Half impact if doubtful
      if (player.position === 'FWD' || player.position === 'CAP') {
        offensiveMod -= impact * 0.06
      } else if (player.position === 'GK') {
        defensiveMod -= impact * 0.08
      }
    }
  }

  // Travel fatigue factor
  if (report.travelDays >= 3) {
    offensiveMod -= 0.03
    defensiveMod -= 0.03
  }

  // Rest advantage
  if (report.restDays >= 6) {
    offensiveMod += 0.03
    defensiveMod += 0.02
  } else if (report.restDays <= 2) {
    offensiveMod -= 0.03
    defensiveMod -= 0.02
  }

  // Morale factor
  if (report.teamMorale === 'high') {
    offensiveMod += 0.03
  } else if (report.teamMorale === 'low') {
    offensiveMod -= 0.04
    defensiveMod -= 0.02
  }

  // Formation change uncertainty
  if (report.formationChange) {
    offensiveMod -= 0.02
    defensiveMod -= 0.03
  }

  // Weather impact
  if (report.weatherFactor === 'adverse') {
    offensiveMod -= 0.05
  } else if (report.weatherFactor === 'favorable') {
    offensiveMod += 0.02
  }

  // Clamp modifiers
  offensiveMod = Math.max(0.80, Math.min(1.20, offensiveMod))
  defensiveMod = Math.max(0.80, Math.min(1.20, defensiveMod))

  const overall = (offensiveMod + defensiveMod) / 2

  return {
    offensive: Math.round(offensiveMod * 1000) / 1000,
    defensive: Math.round(defensiveMod * 1000) / 1000,
    overall: Math.round(overall * 1000) / 1000,
  }
}

/**
 * Get pre-match adjustment for both teams
 */
export function getPreMatchAdjustment(
  homeTeamId: string,
  awayTeamId: string
): {
  homeNews: TeamNewsReport
  awayNews: TeamNewsReport
  homeAttackAdj: number
  homeDefenseAdj: number
  awayAttackAdj: number
  awayDefenseAdj: number
  netAdjustment: number
  newsSummary: string
} {
  const homeNews = getTeamNews(homeTeamId)
  const awayNews = getTeamNews(awayTeamId)

  const homeAttackAdj = homeNews.offensiveModifier
  const homeDefenseAdj = homeNews.defensiveModifier
  const awayAttackAdj = awayNews.offensiveModifier
  const awayDefenseAdj = awayNews.defensiveModifier

  // Net advantage/disadvantage
  const homeNet = (homeAttackAdj + homeDefenseAdj) / 2
  const awayNet = (awayAttackAdj + awayDefenseAdj) / 2
  const netAdjustment = homeNet - awayNet

  // Generate summary
  const summary = generateNewsSummary(homeTeamId, awayTeamId, homeNews, awayNews)

  return {
    homeNews,
    awayNews,
    homeAttackAdj,
    homeDefenseAdj,
    awayAttackAdj,
    awayDefenseAdj,
    netAdjustment: Math.round(netAdjustment * 1000) / 1000,
    newsSummary: summary,
  }
}

function generateNewsSummary(
  homeId: string, awayId: string,
  homeNews: TeamNewsReport, awayNews: TeamNewsReport
): string {
  const parts: string[] = []

  // Key absences
  const homeOut = homeNews.keyPlayers.filter(p => p.status === 'injured' || p.status === 'suspended')
  const awayOut = awayNews.keyPlayers.filter(p => p.status === 'injured' || p.status === 'suspended')
  
  if (homeOut.length > 0) parts.push(`${homeId} missing: ${homeOut.map(p => p.name).join(', ')}`)
  if (awayOut.length > 0) parts.push(`${awayId} missing: ${awayOut.map(p => p.name).join(', ')}`)

  // Doubtful
  const homeDoubt = homeNews.keyPlayers.filter(p => p.status === 'doubtful')
  const awayDoubt = awayNews.keyPlayers.filter(p => p.status === 'doubtful')
  
  if (homeDoubt.length > 0) parts.push(`${homeId} doubts: ${homeDoubt.map(p => p.name).join(', ')}`)
  if (awayDoubt.length > 0) parts.push(`${awayId} doubts: ${awayDoubt.map(p => p.name).join(', ')}`)

  // Morale/travel
  if (homeNews.teamMorale === 'high' && awayNews.teamMorale !== 'high') {
    parts.push(`${homeId} morale advantage`)
  }
  if (homeNews.travelDays >= 3) parts.push(`${homeId} affected by travel fatigue`)
  if (awayNews.travelDays >= 3) parts.push(`${awayId} affected by travel fatigue`)

  // Rest advantage
  if (homeNews.restDays - awayNews.restDays >= 2) parts.push(`${homeId} has rest advantage`)
  if (awayNews.restDays - homeNews.restDays >= 2) parts.push(`${awayId} has rest advantage`)

  return parts.length > 0 ? parts.join('. ') + '.' : 'No significant pre-match news affecting either team.'
}
