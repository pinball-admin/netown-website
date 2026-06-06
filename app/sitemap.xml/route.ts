import { NextResponse } from 'next/server'
import { teamsData } from '@/libs/data/teams-data'
import { worldCupHistory } from '@/libs/data/worldcup-history'

const BASE_URL = 'https://football.netown.cn'
const SUPPORTED_LOCALES = ['en', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'zh']

function buildAlternateLinks(path: string): string {
  return SUPPORTED_LOCALES.map(lang =>
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}${path}"/>`
  ).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${path}"/>`
}

export async function GET() {
  const paths: string[] = []

  // 1. Static pages
  paths.push('')
  paths.push('/football')
  paths.push('/football/schedule')
  paths.push('/football/forum')
  paths.push('/football/history')
  paths.push('/teams')
  paths.push('/disclaimer')
  paths.push('/privacy-policy')
  paths.push('/terms')

  // 2. 48 team pages (football/teams/[id])
  Object.keys(teamsData).forEach(id => {
    paths.push(`/football/teams/${id}`)
  })

  // 3. 48 [slug] team pages (team-xxx)
  Object.keys(teamsData).forEach(id => {
    const name = teamsData[id].name.toLowerCase().replace(/\s+/g, '-')
    paths.push(`/team-${name}`)
  })

  // 4. H2H pages
  const h2hPairs = [
    'argentina-vs-brazil', 'argentina-vs-france', 'brazil-vs-france',
    'england-vs-germany', 'spain-vs-germany', 'portugal-vs-france',
    'usa-vs-mexico', 'japan-vs-south-korea', 'morocco-vs-croatia',
    'belgium-vs-netherlands',
  ]
  h2hPairs.forEach(pair => {
    paths.push(`/h2h-${pair}`)
  })

  // 5. 22 history pages
  Object.keys(worldCupHistory).forEach(year => {
    paths.push(`/football/history/${year}`)
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.8"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${paths.map(path => {
    const priority = path === '' ? '1.0' : path.startsWith('/football/teams/') ? '0.8' : path.startsWith('/football/history') ? '0.7' : '0.6'
    const changefreq = path === '' || path === '/football' ? 'daily' : 'weekly'
    return `
  <url>
    <loc>${BASE_URL}/en${path}</loc>
${buildAlternateLinks(path)}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
