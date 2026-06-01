import { TEAM_NAME_MAP } from '@/app/[slug]/teamNameMap'

export async function GET() {
  const baseUrl = 'https://football.netown.cn'
  
  const teamSlugs = Object.keys(TEAM_NAME_MAP).map(key => `team-${key}`)
  
  const h2hCombinations: string[] = []
  const teams = Object.keys(TEAM_NAME_MAP).slice(0, 8)
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      h2hCombinations.push(`h2h-${teams[i]}-vs-${teams[j]}`)
      h2hCombinations.push(`h2h-${teams[j]}-vs-${teams[i]}`)
    }
  }

  const pages = [
    { path: '/', priority: 1.0 },
    { path: '/football', priority: 0.9 },
    { path: '/teams', priority: 0.8 },
    { path: '/disclaimer', priority: 0.5 },
    { path: '/privacy-policy', priority: 0.5 },
    { path: '/terms', priority: 0.5 },
  ]

  const sitemapEntries = pages.map(page => 
    `<url>
      <loc>${baseUrl}${page.path}</loc>
      <priority>${page.priority}</priority>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>`
  ).join('\n')

  const teamEntries = teamSlugs.map(slug => 
    `<url>
      <loc>${baseUrl}/${slug}</loc>
      <priority>0.8</priority>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>`
  ).join('\n')

  const h2hEntries = h2hCombinations.map(slug => 
    `<url>
      <loc>${baseUrl}/${slug}</loc>
      <priority>0.7</priority>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
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
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
    }
  })
}
