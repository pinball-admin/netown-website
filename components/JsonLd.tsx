interface TeamJsonLdProps {
  name: string
  description: string
  url: string
  logo?: string
  foundingDate?: string
  address?: string
}

export function TeamJsonLd({ name, description, url, logo, foundingDate, address }: TeamJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name,
    description,
    url,
    sport: 'Football',
    ...(logo && { logo }),
    ...(foundingDate && { foundingDate }),
    ...(address && { 
      location: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: address
        }
      }
    }),
    sameAs: [
      `https://en.wikipedia.org/wiki/${name.replace(/\s+/g, '_')}_national_football_team`
    ]
  }

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'SportsTeam',
      name,
      description
    },
    description: `Complete profile of ${name} national football team for World Cup 2026. View squad, stats, fixtures, and AI predictions.`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
    </>
  )
}

interface H2HJsonLdProps {
  homeTeam: string
  awayTeam: string
  description: string
  url: string
  expertPredictions?: Array<{
    expertName: string
    prediction: string
    confidence: number
  }>
  communityStats?: {
    totalPredictions: number
    homeWinPercentage: number
    drawPercentage: number
    awayWinPercentage: number
  }
}

export function H2HJsonLd({ 
  homeTeam, 
  awayTeam, 
  description, 
  url,
  expertPredictions = [],
  communityStats
}: H2HJsonLdProps) {
  const sportsEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${homeTeam} vs ${awayTeam}`,
    description,
    url,
    startDate: '2026-06-15T00:00:00Z',
    endDate: '2026-07-19T00:00:00Z',
    location: {
      '@type': 'Place',
      name: 'World Cup 2026 Venue',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US'
      }
    },
    competitor: [
      {
        '@type': 'SportsTeam',
        name: homeTeam
      },
      {
        '@type': 'SportsTeam',
        name: awayTeam
      }
    ]
  }

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${homeTeam} vs ${awayTeam} AI Prediction Dataset`,
    description: `Comprehensive AI-powered predictions and H2H statistics for ${homeTeam} vs ${awayTeam} match. Includes 5 expert AI predictions and community analysis.`,
    url,
    keywords: ['World Cup 2026', 'AI predictions', 'H2H statistics', homeTeam, awayTeam, 'football', 'soccer'],
    creator: {
      '@type': 'Organization',
      name: 'Netown Arena',
      url: 'https://football.netown.cn'
    },
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Expert AI Predictions',
        description: expertPredictions.length > 0 
          ? expertPredictions.map(p => `${p.expertName}: ${p.prediction} (${p.confidence}% confidence)`).join('; ')
          : '5 AI experts provide predictions with confidence scores'
      },
      ...(communityStats ? [{
        '@type': 'DataDownload',
        name: 'Community Predictions',
        description: `${communityStats.totalPredictions} predictions: Home ${communityStats.homeWinPercentage}%, Draw ${communityStats.drawPercentage}%, Away ${communityStats.awayWinPercentage}%`
      }] : [])
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
    </>
  )
}

interface WebsiteJsonLdProps {
  name: string
  url: string
  description: string
}

export function WebsiteJsonLd({ name, url, description }: WebsiteJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
