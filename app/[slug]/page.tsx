import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMockTeamStats, getMockAllTeams } from '@/libs/services/football-data'
import { getTeams } from '@/libs/services/wheniskickoff'
import TeamPageContent from './TeamPageContent'
import H2HPageContent from './H2HPageContent'
import { TEAM_NAME_MAP } from './teamNameMap'

interface Props {
  params: { slug: string }
}

function normalizeTeamSlug(slug: string): string {
  return TEAM_NAME_MAP[slug.toLowerCase()] || slug.toUpperCase()
}

export async function generateStaticParams() {
  const teams = getTeams()
  const params: Array<{ slug: string }> = []

  // 生成所有球队页面
  teams.forEach(team => {
    params.push({ slug: `team-${team.name.toLowerCase().replace(/\s+/g, '-')}` })
  })

  // 生成部分H2H页面（示例）
  const h2hPairs = [
    'argentina-vs-brazil',
    'argentina-vs-france',
    'brazil-vs-france',
    'england-vs-germany',
    'spain-vs-germany',
    'portugal-vs-france',
    'usa-vs-mexico',
    'japan-vs-south-korea',
    'morocco-vs-croatia',
    'belgium-vs-netherlands',
  ]
  
  h2hPairs.forEach(pair => {
    params.push({ slug: `h2h-${pair}` })
  })

  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  
  if (slug.startsWith('team-')) {
    const teamId = normalizeTeamSlug(slug.replace('team-', ''))
    const team = getMockTeamStats(teamId)
    return {
      title: `${team.name} World Cup 2026 Team Profile`,
      description: `Complete profile of ${team.name} national football team. View squad, stats, fixtures, and AI predictions for World Cup 2026.`,
    }
  }
  
  if (slug.startsWith('h2h-')) {
    const pair = slug.replace('h2h-', '')
    return {
      title: `${pair.replace('-vs-', ' vs ')} H2H History & Predictions`,
      description: `Head-to-head statistics and AI predictions for ${pair.replace('-vs-', ' vs ')}.`,
    }
  }

  return {
    title: 'Not Found',
  }
}

export default async function GenericPage({ params }: Props) {
  const slug = params.slug

  // 1. 匹配球队百科页：例如 team-argentina
  if (slug.startsWith('team-')) {
    const teamSlug = slug.replace('team-', '')
    const teamId = normalizeTeamSlug(teamSlug)
    const team = getMockTeamStats(teamId)
    const allTeams = getTeams()

    if (!team.name || team.name === teamId) {
      notFound()
    }

    const mockAllTeams = getMockAllTeams()
    const relatedTeams = mockAllTeams
      .filter(t => t.group === team.group && t.id !== team.id)
      .slice(0, 3)

    // 简单的模拟数据
    const form = ['W', 'W', 'D', 'W', 'L']
    const squad = [
      { name: 'Star Player', position: 'Forward', number: 10 },
      { name: 'Key Midfielder', position: 'Midfielder', number: 8 },
      { name: 'Goalkeeper', position: 'Goalkeeper', number: 1 },
      { name: 'Defender', position: 'Defender', number: 4 },
      { name: 'Defender', position: 'Defender', number: 3 },
      { name: 'Midfielder', position: 'Midfielder', number: 6 },
      { name: 'Forward', position: 'Forward', number: 9 },
      { name: 'Midfielder', position: 'Midfielder', number: 7 },
    ]

    return (
      <TeamPageContent
        team={team}
        teamId={teamId}
        relatedTeams={relatedTeams}
        form={form}
        squad={squad}
      />
    )
  }

  // 2. 匹配H2H历史页：例如 h2h-argentina-vs-brazil
  if (slug.startsWith('h2h-')) {
    const h2hPair = slug.replace('h2h-', '')
    const [homeTeamSlug, awayTeamSlug] = h2hPair.split('-vs-')
    
    if (homeTeamSlug && awayTeamSlug) {
      const homeTeamId = normalizeTeamSlug(homeTeamSlug)
      const awayTeamId = normalizeTeamSlug(awayTeamSlug)
      
      const homeTeam = getMockTeamStats(homeTeamId)
      const awayTeam = getMockTeamStats(awayTeamId)

      if (!homeTeam.name || !awayTeam.name) {
        notFound()
      }

      return (
        <H2HPageContent
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )
    }
  }

  // 3. 其他情况返回 404
  notFound()
}
