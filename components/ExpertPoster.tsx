'use client'

import { ExpertId } from '@/libs/types'

interface ExpertPosterProps {
  expertId: ExpertId
  expertName: string
  accuracy: number
  streak: number
  totalMatches: number
  correctResults: number
  medals: string[]
  matchResult?: {
    homeTeam: string
    awayTeam: string
    score: string
  }
}

export function generateExpertPosterHTML(props: ExpertPosterProps): string {
  const {
    expertId,
    expertName,
    accuracy,
    streak,
    totalMatches,
    correctResults,
    medals,
    matchResult,
  } = props

  const gradients: Record<ExpertId, string> = {
    beckham_chen: 'from-blue-500 to-purple-600',
    zidane_gao: 'from-amber-500 to-orange-600',
    batistuta_zhang: 'from-red-500 to-rose-600',
    shearer_zhang: 'from-green-500 to-emerald-600',
    ronaldo_silva: 'from-yellow-500 to-amber-600',
  }

  const icons: Record<ExpertId, string> = {
    beckham_chen: '⚽',
    zidane_gao: '🔮',
    batistuta_zhang: '⚡',
    shearer_zhang: '🎯',
    ronaldo_silva: '💫',
  }

  const gradient = gradients[expertId]
  const icon = icons[expertId]

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .poster {
      width: 600px;
      background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    }
    .header {
      height: 8px;
      background: linear-gradient(90deg, #fbbf24, #f59e0b, #ea580c);
    }
    .content {
      padding: 40px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
      border: 1px solid rgba(251, 191, 36, 0.4);
      border-radius: 50px;
      padding: 8px 16px;
      margin-bottom: 24px;
    }
    .badge-icon { font-size: 24px; }
    .badge-text {
      color: #fbbf24;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .expert {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }
    .expert-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, ${gradient.includes('blue') ? '#3b82f6, #8b5cf6' : gradient.includes('amber') ? '#f59e0b, #ea580c' : gradient.includes('red') ? '#ef4444, #f43f5e' : gradient.includes('green') ? '#22c55e, #10b981' : '#eab308, #f59e0b'});
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .expert-info h1 {
      color: #ffffff;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .expert-info p {
      color: #9ca3af;
      font-size: 14px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      color: #22c55e;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .stat-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .match-result {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1));
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .match-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .match-score {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
    }
    .match-teams {
      color: #9ca3af;
      font-size: 14px;
      margin-top: 4px;
    }
    .medals {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .medal {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
      border-radius: 50px;
      padding: 6px 12px;
      color: #fbbf24;
      font-size: 12px;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      padding: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .brand {
      color: #00FF66;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .url {
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="header"></div>
    <div class="content">
      <div class="badge">
        <span class="badge-icon">👑</span>
        <span class="badge-text">神算子</span>
      </div>

      <div class="expert">
        <div class="expert-icon">${icon}</div>
        <div class="expert-info">
          <h1>${expertName}</h1>
          <p>Netown AI Prediction Expert</p>
        </div>
      </div>

      ${matchResult ? `
      <div class="match-result">
        <div class="match-label">Latest Prediction</div>
        <div class="match-score">${matchResult.score}</div>
        <div class="match-teams">${matchResult.homeTeam} vs ${matchResult.awayTeam}</div>
      </div>
      ` : ''}

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat">
          <div class="stat-value">🔥${streak}</div>
          <div class="stat-label">Win Streak</div>
        </div>
        <div class="stat">
          <div class="stat-value">${totalMatches}</div>
          <div class="stat-label">Total Matches</div>
        </div>
        <div class="stat">
          <div class="stat-value">${correctResults}</div>
          <div class="stat-label">Correct Results</div>
        </div>
      </div>

      ${medals.length > 0 ? `
      <div class="medals">
        ${medals.map(m => `<span class="medal">${m.replace('_', ' ')}</span>`).join('')}
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <div class="brand">⚽ Netown</div>
      <div class="url">football.netown.cn</div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function generateExpertPosterImage(
  props: ExpertPosterProps
): Promise<string> {
  const html = generateExpertPosterHTML(props)

  try {
    const { default: htmlToImage } = await import('html-to-image')

    const container = document.createElement('div')
    container.innerHTML = html
    const element = container.firstElementChild as HTMLElement

    if (!element) {
      throw new Error('Failed to create poster element')
    }

    document.body.appendChild(element)

    const dataUrl = await htmlToImage.toPng(element, {
      quality: 1,
      pixelRatio: 2,
      width: 600,
      height: 800,
    })

    document.body.removeChild(element)

    return dataUrl
  } catch (error) {
    console.error('Failed to generate poster image:', error)
    throw error
  }
}

export function downloadPosterImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}