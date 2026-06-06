interface TournamentJsonLdProps {
  year: number
  champion: string
  runnerUp: string
  description: string
  url: string
  startDate: string
  endDate: string
  hostCountries: string[]
}

export function TournamentJsonLd({
  year,
  champion,
  runnerUp,
  description,
  url,
  startDate,
  endDate,
  hostCountries,
}: TournamentJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${year} FIFA World Cup`,
    description,
    url,
    startDate,
    endDate,
    location: {
      '@type': 'Place',
      name: hostCountries.join(' & '),
      address: {
        '@type': 'PostalAddress',
        addressCountry: hostCountries.join(', '),
      },
    },
    competitor: [
      {
        '@type': 'SportsTeam',
        name: champion,
      },
      {
        '@type': 'SportsTeam',
        name: runnerUp,
      },
    ],
    superEvent: {
      '@type': 'SportsEvent',
      name: 'FIFA World Cup',
      description: 'The FIFA World Cup is the most prestigious international football tournament.',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
