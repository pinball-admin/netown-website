import { Metadata } from 'next'
import { getTeams } from '@/libs/services/wheniskickoff'
import TeamsPageContent from './TeamsPageContent'

export const metadata: Metadata = {
  title: 'World Cup 2026 Teams - All 48 Squads, Fixtures & Predictions',
  description: 'Complete list of all 48 teams competing in FIFA World Cup 2026. View squad details, form guide, H2H records, and get AI expert predictions for each team.',
  keywords: [
    'World Cup 2026',
    'teams',
    'squads',
    'fixtures',
    'predictions',
    'all teams',
    '48 teams',
    'World Cup squads',
  ],
}

export default async function TeamsPage() {
  const allTeams = getTeams()

  return <TeamsPageContent allTeams={allTeams} />
}
