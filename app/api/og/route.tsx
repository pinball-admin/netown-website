import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * OG Image API - Social sharing cards (SVG-based)
 *
 * Generates dynamic OG images for:
 * - Match predictions (type=match)
 * - Settlement results (type=settlement)
 * - Leaderboard rankings (type=leaderboard)
 *
 * Returns SVG images that work across all social platforms.
 * Uses SVG instead of @vercel/og for cross-platform local dev compatibility.
 *
 * Usage:
 *   /api/og?type=match&home=Argentina&away=Brazil&hWin=45&draw=25&aWin=30&score=2-1&confidence=78
 *   /api/og?type=settlement&home=ARG&away=BRA&hScore=3&aScore=1&settled=24&correct=18
 *   /api/og?type=leaderboard&name=Player&rank=5&accuracy=72&candy=1250&streak=3
 *   /api/og?type=prediction&home=Argentina&away=Brazil&hFlag=🇦🇷&aFlag=🇧🇷
 *        &prediction=2-1&status=correct&points=15&username=Fan123
 */

const W = 1200
const H = 630

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'match'

  try {
    let svg: string
    switch (type) {
      case 'settlement':
        svg = settlementSVG(searchParams)
        break
      case 'leaderboard':
        svg = leaderboardSVG(searchParams)
        break
      case 'prediction':
        svg = predictionSVG(searchParams)
        break
      case 'match':
      default:
        svg = matchSVG(searchParams)
        break
    }

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    })
  } catch (err: any) {
    return new NextResponse(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect width="100%" height="100%" fill="#030712"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#ef4444" font-size="24" font-family="system-ui,sans-serif">OG Image Error: ${esc(err.message)}</text>
    </svg>`, {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}

function matchSVG(p: URLSearchParams): string {
  const home = p.get('home') || 'Home'
  const away = p.get('away') || 'Away'
  const hWin = p.get('hWin') || '0'
  const draw = p.get('draw') || '0'
  const aWin = p.get('aWin') || '0'
  const score = p.get('score') || '?-?'
  const conf = p.get('confidence') || '70'
  const hFlag = p.get('hFlag') || '⚽'
  const aFlag = p.get('aFlag') || '⚽'
  const date = p.get('date') || ''
  const venue = p.get('venue') || ''

  const confNum = Math.min(100, Math.max(0, parseInt(conf)))
  const confColor = confNum > 70 ? '#22c55e' : confNum > 50 ? '#eab308' : '#ef4444'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="40%" stop-color="#0f172a"/>
      <stop offset="70%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${confColor}"/>
      <stop offset="100%" stop-color="${confColor}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="80" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>

  <!-- Ambient glows -->
  <circle cx="0" cy="0" r="200" fill="rgba(249,115,22,0.06)"/>
  <circle cx="${W}" cy="${H}" r="200" fill="rgba(239,68,68,0.06)"/>

  <!-- Header -->
  <text x="48" y="74" font-size="36" font-family="system-ui,sans-serif">🤖</text>
  <text x="100" y="64" font-size="28" font-weight="800" font-family="system-ui,sans-serif" fill="url(#titleGrad)">Netown AI Oracle</text>
  <text x="100" y="88" font-size="16" font-family="system-ui,sans-serif" fill="#94a3b8">Match Prediction Analysis</text>

  ${date ? `<text x="${W - 48}" y="70" font-size="14" font-family="system-ui,sans-serif" fill="#475569" text-anchor="end">📅 ${esc(date)}</text>` : ''}

  <!-- Timestamp -->
  <text x="${W - 48}" y="92" font-size="11" font-family="system-ui,sans-serif" fill="#334155" text-anchor="end">⏱ Generated ${new Date().toISOString().substring(0, 16).replace('T', ' ')} UTC</text>

  <!-- Teams -->
  <g transform="translate(0, 140)">
    <!-- Home -->
    <text x="${W / 2 - 220}" y="0" font-size="64" text-anchor="middle">${esc(hFlag)}</text>
    <text x="${W / 2 - 220}" y="80" font-size="36" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(home)}</text>
    <text x="${W / 2 - 220}" y="110" font-size="20" font-weight="600" font-family="system-ui,sans-serif" fill="${parseInt(hWin) > parseInt(aWin) ? '#f97316' : '#64748b'}" text-anchor="middle">${esc(hWin)}%</text>

    <!-- VS -->
    <text x="${W / 2}" y="10" font-size="18" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">VS</text>
    <text x="${W / 2}" y="55" font-size="32" font-weight="800" font-family="system-ui,sans-serif" fill="#22c55e" text-anchor="middle">${esc(score)}</text>
    <text x="${W / 2}" y="80" font-size="16" font-weight="600" font-family="system-ui,sans-serif" fill="${parseInt(draw) > 20 ? '#eab308' : '#475569'}" text-anchor="middle">Draw ${esc(draw)}%</text>

    <!-- Away -->
    <text x="${W / 2 + 220}" y="0" font-size="64" text-anchor="middle">${esc(aFlag)}</text>
    <text x="${W / 2 + 220}" y="80" font-size="36" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(away)}</text>
    <text x="${W / 2 + 220}" y="110" font-size="20" font-weight="600" font-family="system-ui,sans-serif" fill="${parseInt(aWin) > parseInt(hWin) ? '#f97316' : '#64748b'}" text-anchor="middle">${esc(aWin)}%</text>
  </g>

  <!-- Win Probability Bar -->
  <g transform="translate(80, 310)">
    <text x="0" y="-8" font-size="12" font-family="system-ui,sans-serif" fill="#64748b">${esc(home)} ${esc(hWin)}%</text>
    <text x="${W - 160}" y="-8" font-size="12" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="end">${esc(away)} ${esc(aWin)}%</text>
    <text x="${(W - 160) / 2}" y="-8" font-size="12" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Draw ${esc(draw)}%</text>

    <rect x="0" y="0" width="${(W - 160) * parseInt(hWin) / 100}" height="10" rx="3" fill="#22c55e"/>
    <rect x="${(W - 160) * parseInt(hWin) / 100}" y="0" width="${(W - 160) * parseInt(draw) / 100}" height="10" fill="#eab308"/>
    <rect x="${(W - 160) * (parseInt(hWin) + parseInt(draw)) / 100}" y="0" width="${(W - 160) * parseInt(aWin) / 100}" height="10" rx="3" fill="#06b6d4"/>
  </g>

  <!-- Confidence bar -->
  <g transform="translate(80, 360)">
    <text x="0" y="0" font-size="16" font-family="system-ui,sans-serif" fill="#94a3b8" font-weight="500">AI Confidence</text>
    <rect x="160" y="-10" width="${W - 300}" height="12" rx="6" fill="rgba(30,41,59,0.6)"/>
    <rect x="160" y="-10" width="${(W - 300) * confNum / 100}" height="12" rx="6" fill="url(#barGrad)"/>
    <text x="${W - 100}" y="4" font-size="20" font-weight="700" font-family="system-ui,sans-serif" fill="${confColor}" text-anchor="end">${esc(conf)}%</text>
  </g>

  <!-- Models -->
  <g transform="translate(80, 410)">
    ${['Dixon-Coles', 'ELO', 'xG', 'Gradient Boost', 'News/Injury'].map((m, i) =>
      `<rect x="${i * 160}" y="0" width="148" height="32" rx="16" fill="rgba(30,41,59,0.5)" stroke="rgba(51,65,85,0.5)" stroke-width="1"/>
       <text x="${i * 160 + 74}" y="21" font-size="14" font-family="system-ui,sans-serif" fill="#94a3b8" text-anchor="middle">${esc(m)}</text>`
    ).join('')}
  </g>

  <!-- Bottom -->
  ${venue ? `<text x="80" y="${H - 50}" font-size="14" font-family="system-ui,sans-serif" fill="#475569">🏟 ${esc(venue)}</text>` : ''}
  <text x="80" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#334155">netown.ai/football</text>
  <text x="${W - 80}" y="${H - 28}" font-size="11" font-family="system-ui,sans-serif" fill="#475569" text-anchor="end">⏱ ${new Date().toISOString().substring(0, 16).replace('T', ' ')} UTC</text>
  <text x="${W - 80}" y="${H - 50}" font-size="14" font-family="system-ui,sans-serif" fill="#475569" text-anchor="end">Powered by AI Oracle</text>
</svg>`
}

function settlementSVG(p: URLSearchParams): string {
  const home = p.get('home') || 'Home'
  const away = p.get('away') || 'Away'
  const hScore = p.get('hScore') || '0'
  const aScore = p.get('aScore') || '0'
  const settled = p.get('settled') || '0'
  const correct = p.get('correct') || '0'
  const sNum = parseInt(settled) || 0
  const cNum = parseInt(correct) || 0
  const acc = sNum > 0 ? Math.round((cNum / sNum) * 100) : 0

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="30%" stop-color="#064e3b"/>
      <stop offset="70%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="0" cy="0" r="200" fill="rgba(34,197,94,0.08)"/>
  <circle cx="${W}" cy="${H}" r="200" fill="rgba(16,185,129,0.05)"/>

  <text x="48" y="60" font-size="40">🏁</text>
  <text x="104" y="58" font-size="32" font-weight="800" font-family="system-ui,sans-serif" fill="url(#titleGrad)">Match Result</text>

  <!-- Score -->
  <g transform="translate(0, 140)">
    <text x="${W / 2 - 200}" y="10" font-size="28" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(home)}</text>
    <text x="${W / 2 - 60}" y="20" font-size="56" font-weight="900" font-family="system-ui,sans-serif" fill="#22c55e" text-anchor="middle">${esc(hScore)}</text>
    <text x="${W / 2}" y="20" font-size="40" font-family="system-ui,sans-serif" fill="#475569" text-anchor="middle">-</text>
    <text x="${W / 2 + 60}" y="20" font-size="56" font-weight="900" font-family="system-ui,sans-serif" fill="#22c55e" text-anchor="middle">${esc(aScore)}</text>
    <text x="${W / 2 + 200}" y="10" font-size="28" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(away)}</text>
  </g>

  <!-- Stats -->
  <g transform="translate(0, 250)">
    <g transform="translate(${W / 2 - 220})">
      <text x="0" y="0" font-size="42" font-weight="800" font-family="system-ui,sans-serif" fill="#22c55e" text-anchor="middle">${esc(settled)}</text>
      <text x="0" y="24" font-size="16" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Predictions</text>
    </g>
    <g transform="translate(${W / 2})">
      <text x="0" y="0" font-size="42" font-weight="800" font-family="system-ui,sans-serif" fill="#06b6d4" text-anchor="middle">${esc(correct)}</text>
      <text x="0" y="24" font-size="16" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Correct</text>
    </g>
    <g transform="translate(${W / 2 + 220})">
      <text x="0" y="0" font-size="42" font-weight="800" font-family="system-ui,sans-serif" fill="${acc > 50 ? '#22c55e' : '#eab308'}" text-anchor="middle">${acc}%</text>
      <text x="0" y="24" font-size="16" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Accuracy</text>
    </g>
  </g>

  <!-- Accuracy bar -->
  <g transform="translate(80, 340)">
    <text x="0" y="0" font-size="14" font-family="system-ui,sans-serif" fill="#94a3b8">Community Accuracy</text>
    <rect x="180" y="-6" width="${W - 260}" height="10" rx="5" fill="rgba(30,41,59,0.6)"/>
    <rect x="180" y="-6" width="${(W - 260) * acc / 100}" height="10" rx="5" fill="url(#barGrad)"/>
    <text x="${W - 80}" y="4" font-size="16" font-weight="700" font-family="system-ui,sans-serif" fill="#22c55e" text-anchor="end">${acc}%</text>
  </g>

  <text x="80" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#334155">netown.ai/football</text>
  <text x="${W - 80}" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#475569" text-anchor="end">Auto-settled by AI Oracle</text>
</svg>`
}

function leaderboardSVG(p: URLSearchParams): string {
  const name = p.get('name') || 'Player'
  const rank = p.get('rank') || '?'
  const accuracy = p.get('accuracy') || '0'
  const candy = p.get('candy') || '0'
  const streak = p.get('streak') || '0'
  const predictions = p.get('predictions') || '0'
  const role = p.get('role') || 'user'
  const rNum = parseInt(rank) || 99
  const isChampion = rNum <= 3
  const rankColors = ['#fbbf24', '#94a3b8', '#d97706']
  const rankColor = isChampion ? rankColors[Math.min(rNum - 1, 2)] : '#e2e8f0'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="30%" stop-color="#312e81"/>
      <stop offset="70%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="masterGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="0" cy="0" r="200" fill="rgba(139,92,246,0.06)"/>
  <circle cx="${W}" cy="${H}" r="200" fill="rgba(99,102,241,0.04)"/>

  <text x="48" y="60" font-size="40">🏆</text>
  <text x="104" y="50" font-size="28" font-weight="800" font-family="system-ui,sans-serif" fill="url(#titleGrad)">Netown Leaderboard</text>
  <text x="104" y="74" font-size="16" font-family="system-ui,sans-serif" fill="#94a3b8">Your Prediction Ranking</text>

  <!-- Rank badge -->
  <g transform="translate(${W / 2}, 180)">
    <circle cx="0" cy="0" r="60" fill="${isChampion ? `rgba(250,204,21,${rNum <= 1 ? '0.15' : '0.1'})` : 'rgba(100,116,139,0.1)'}" stroke="${isChampion ? 'rgba(250,204,21,0.4)' : 'rgba(100,116,139,0.3)'}" stroke-width="4"/>
    <text x="0" y="-14" font-size="16" font-family="system-ui,sans-serif" fill="#94a3b8" text-anchor="middle">RANK</text>
    <text x="0" y="24" font-size="48" font-weight="900" font-family="system-ui,sans-serif" fill="${rankColor}" text-anchor="middle">#${esc(rank)}</text>
  </g>

  <!-- Name + Role -->
  <g transform="translate(${W / 2}, 280)">
    <text x="0" y="0" font-size="28" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(name)}</text>
    ${role === 'master' ? `<rect x="60" y="-18" width="96" height="28" rx="14" fill="url(#masterGrad)"/><text x="108" y="2" font-size="14" font-weight="600" font-family="system-ui,sans-serif" fill="#fff" text-anchor="middle">Master</text>` : ''}
  </g>

  <!-- Stats -->
  <g transform="translate(0, 340)">
    <g transform="translate(${W / 2 - 240})">
      <text x="0" y="0" font-size="36" font-weight="800" font-family="system-ui,sans-serif" fill="#a855f7" text-anchor="middle">${esc(accuracy)}%</text>
      <text x="0" y="20" font-size="14" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Accuracy</text>
    </g>
    <g transform="translate(${W / 2 - 80})">
      <text x="0" y="0" font-size="36" font-weight="800" font-family="system-ui,sans-serif" fill="#f97316" text-anchor="middle">${esc(candy)}</text>
      <text x="0" y="20" font-size="14" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Candy 🍬</text>
    </g>
    <g transform="translate(${W / 2 + 80})">
      <text x="0" y="0" font-size="36" font-weight="800" font-family="system-ui,sans-serif" fill="#22c55e" text-anchor="middle">${esc(predictions)}</text>
      <text x="0" y="20" font-size="14" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Predictions</text>
    </g>
    <g transform="translate(${W / 2 + 240})">
      <text x="0" y="0" font-size="36" font-weight="800" font-family="system-ui,sans-serif" fill="${parseInt(streak) >= 5 ? '#fbbf24' : '#06b6d4'}" text-anchor="middle">${esc(streak)}🔥</text>
      <text x="0" y="20" font-size="14" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">Streak</text>
    </g>
  </g>

  <text x="80" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#334155">netown.ai/leaderboard</text>
  <text x="${W - 80}" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#475569" text-anchor="end">World Cup 2026</text>
</svg>`
}

function predictionSVG(p: URLSearchParams): string {
  const home = p.get('home') || 'Home'
  const away = p.get('away') || 'Away'
  const hFlag = p.get('hFlag') || '⚽'
  const aFlag = p.get('aFlag') || '⚽'
  const prediction = p.get('prediction') || '?'
  const pType = p.get('typeLabel') || 'MATCH_RESULT'
  const status = p.get('status') || 'pending'
  const points = p.get('points') || '0'
  const username = p.get('username') || 'Player'

  const isCorrect = status === 'correct'
  const isPending = status === 'pending'
  const statusEmoji = isCorrect ? '✅' : isPending ? '⏳' : '❌'
  const statusColor = isCorrect ? '#22c55e' : isPending ? '#eab308' : '#ef4444'
  const statusText = isCorrect ? 'Correct' : isPending ? 'Pending' : 'Incorrect'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="35%" stop-color="#1e1b4b"/>
      <stop offset="70%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${statusColor}"/>
      <stop offset="100%" stop-color="${isCorrect ? '#06b6d4' : isPending ? '#f97316' : '#ef4444'}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="0" cy="0" r="200" fill="rgba(34,197,94,0.05)"/>
  <circle cx="${W}" cy="${H}" r="200" fill="rgba(99,102,241,0.04)"/>

  <!-- Header -->
  <text x="48" y="60" font-size="36">🏆</text>
  <text x="100" y="52" font-size="28" font-weight="800" font-family="system-ui,sans-serif" fill="url(#titleGrad)">Netown Prediction</text>
  <text x="100" y="76" font-size="16" font-family="system-ui,sans-serif" fill="#94a3b8">User Prediction Result</text>

  <!-- Status Badge -->
  <g transform="translate(${W - 160}, 40)">
    <rect x="0" y="0" width="130" height="36" rx="18" fill="rgba(30,41,59,0.6)" stroke="${statusColor}40" stroke-width="1"/>
    <text x="65" y="24" font-size="18" font-weight="700" font-family="system-ui,sans-serif" fill="${statusColor}" text-anchor="middle">${statusEmoji} ${esc(statusText)}</text>
  </g>

  <!-- Teams -->
  <g transform="translate(0, 150)">
    <text x="${W / 2 - 200}" y="0" font-size="72" text-anchor="middle">${esc(hFlag)}</text>
    <text x="${W / 2 - 200}" y="80" font-size="32" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(home)}</text>

    <text x="${W / 2}" y="10" font-size="18" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">VS</text>
    <text x="${W / 2}" y="60" font-size="34" font-weight="900" font-family="system-ui,sans-serif" fill="${statusColor}" text-anchor="middle">${esc(prediction)}</text>
    <text x="${W / 2}" y="85" font-size="12" font-family="system-ui,sans-serif" fill="#64748b" text-anchor="middle">${esc(pType.replace(/_/g, ' '))}</text>

    <text x="${W / 2 + 200}" y="0" font-size="72" text-anchor="middle">${esc(aFlag)}</text>
    <text x="${W / 2 + 200}" y="80" font-size="32" font-weight="700" font-family="system-ui,sans-serif" fill="#f8fafc" text-anchor="middle">${esc(away)}</text>
  </g>

  <!-- User Info + Points -->
  <g transform="translate(0, 290)">
    <!-- Username -->
    <text x="${W / 2}" y="0" font-size="22" font-weight="600" font-family="system-ui,sans-serif" fill="#e2e8f0" text-anchor="middle">${esc(username)}</text>

    <!-- Points earned (only if correct) -->
    ${isCorrect && parseInt(points) > 0 ? `
    <g transform="translate(${W / 2}, 40)">
      <rect x="-60" y="0" width="120" height="40" rx="20" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
      <text x="0" y="26" font-size="22" font-weight="800" font-family="system-ui,sans-serif" fill="#fbbf24" text-anchor="middle">+${esc(points)} 🍬</text>
    </g>` : ''}
  </g>

  <!-- Bottom -->
  <text x="80" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#334155">netown.ai/football</text>
  <text x="${W - 80}" y="${H - 28}" font-size="14" font-family="system-ui,sans-serif" fill="#475569" text-anchor="end">World Cup 2026</text>
</svg>`
}
