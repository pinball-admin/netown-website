import { TEAM_NAME_MAP } from '@/app/[slug]/teamNameMap'
import { getTeams } from '@/libs/services/wheniskickoff'

export async function GET() {
  const baseUrl = 'https://football.netown.cn'
  const today = new Date().toISOString().split('T')[0]
  
  const teamSlugs = Object.keys(TEAM_NAME_MAP).map(key => `team-${key}`)
  
  const teams = Object.keys(TEAM_NAME_MAP)
  const h2hCombinations: string[] = []
  
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      h2hCombinations.push(`h2h-${teams[i]}-vs-${teams[j]}`)
      h2hCombinations.push(`h2h-${teams[j]}-vs-${teams[i]}`)
    }
  }

  const pages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/football', priority: 0.9, changefreq: 'daily' },
    { path: '/teams', priority: 0.8, changefreq: 'weekly' },
    { path: '/disclaimer', priority: 0.5, changefreq: 'monthly' },
    { path: '/privacy-policy', priority: 0.5, changefreq: 'monthly' },
    { path: '/terms', priority: 0.5, changefreq: 'monthly' },
  ]

  const sitemapEntries = pages.map(page => 
    `<url>
      <loc>${baseUrl}${page.path}</loc>
      <priority>${page.priority}</priority>
      <changefreq>${page.changefreq}</changefreq>
      <lastmod>${today}</lastmod>
    </url>`
  ).join('\n')

  const teamEntries = teamSlugs.map(slug => 
    `<url>
      <loc>${baseUrl}/${slug}</loc>
      <priority>0.8</priority>
      <changefreq>weekly</changefreq>
      <lastmod>${today}</lastmod>
    </url>`
  ).join('\n')

  const h2hEntries = h2hCombinations.map(slug => 
    `<url>
      <loc>${baseUrl}/${slug}</loc>
      <priority>0.7</priority>
      <changefreq>daily</changefreq>
      <lastmod>${today}</lastmod>
    </url>`
  ).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
  ${teamEntries}
  ${h2hEntries}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
