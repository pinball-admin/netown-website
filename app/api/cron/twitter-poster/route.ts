import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface TweetCandidate {
  type: 'match_preview' | 'countdown' | 'tournament_fact'
  content: string
  url: string
  hashtags: string[]
}

/**
 * Generate tweets for upcoming matches / tournament promotion.
 * 
 * To enable auto-posting, set:
 *   TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 * 
 * Without these keys, the cron logs tweets for manual posting.
 * 
 * Vercel cron schedule: every 6 hours
 */
export async function GET(request: Request) {
  // Auth check (same pattern as other cron routes)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const isAuthorized = isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (!cronSecret && !isVercelCron)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tweets = await generateTweets()
    const hasTwitterKeys = !!(process.env.TWITTER_API_KEY)

    // If Twitter API keys exist, we would post here
    // For now, return tweet candidates for manual posting
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      hasTwitterKeys,
      tweetCount: tweets.length,
      tweets,
      note: !hasTwitterKeys
        ? 'Set TWITTER_API_KEY env vars to enable auto-posting. For now, manually post from these candidates.'
        : undefined,
    })
  } catch (err: any) {
    console.error('[Twitter Cron] Failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function generateTweets(): Promise<TweetCandidate[]> {
  const tweets: TweetCandidate[] = []
  const now = new Date()

  // --- 1. Countdown tweet ---
  const openingDay = new Date('2026-06-11T15:00:00-04:00') // first match
  const daysUntil = Math.ceil((openingDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil > 0 && daysUntil <= 30) {
    tweets.push({
      type: 'countdown',
      content: `⏳ Only ${daysUntil} day${daysUntil > 1 ? 's' : ''} until the 2026 FIFA World Cup! 🏆\n\nWho's your pick to win it all?\n\nAI predictions are LIVE now →`,
      url: 'https://football.netown.cn/en/football',
      hashtags: ['WorldCup2026', 'Football', 'AI', 'Predictions'],
    })
  }

  // --- 2. Match previews (next 48h) ---
  // Parse static schedule for upcoming matches
  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const teamNames: Record<string, string> = {
    MEX:'Mexico',KOR:'South Korea',CZE:'Czech Republic',RSA:'South Africa',
    CAN:'Canada',BIH:'Bosnia',QAT:'Qatar',SUI:'Switzerland',
    BRA:'Brazil',MAR:'Morocco',HAI:'Haiti',SCO:'Scotland',
    USA:'United States',PAR:'Paraguay',AUS:'Australia',TUR:'Turkey',
    GER:'Germany',CUW:'Curacao',ECU:'Ecuador',CIV:'Ivory Coast',
    NED:'Netherlands',JPN:'Japan',SWE:'Sweden',TUN:'Tunisia',
    BEL:'Belgium',EGY:'Egypt',IRN:'Iran',NZL:'New Zealand',
    ESP:'Spain',CPV:'Cape Verde',KSA:'Saudi Arabia',URU:'Uruguay',
    FRA:'France',SEN:'Senegal',IRQ:'Iraq',NOR:'Norway',
    ARG:'Argentina',ALG:'Algeria',AUT:'Austria',JOR:'Jordan',
    POR:'Portugal',COD:'Congo DR',UZB:'Uzbekistan',COL:'Colombia',
    ENG:'England',CRO:'Croatia',GHA:'Ghana',PAN:'Panama',
  }

  for (const group of groups) {
    const { getGroupMatches } = await import('@/libs/data/worldcup-schedule')
    const matches = getGroupMatches(group)
    for (const match of matches) {
      const matchDate = new Date(`${match.date}T${match.time}:00-04:00`)
      const hoursUntil = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      // Only tweet about matches in the next 48 hours
      if (hoursUntil > 0 && hoursUntil <= 48) {
        const home = teamNames[match.team1] || match.team1
        const away = teamNames[match.team2] || match.team2
        const matchPath = `/en/football`

        tweets.push({
          type: 'match_preview',
          content: `⚽ UP NEXT: ${home} 🆚 ${away}\n\n📅 ${match.date} at ${match.time}\n📍 ${match.venue}\n\n🤖 AI predictions are ready!\n\nView analysis →`,
          url: `https://football.netown.cn${matchPath}`,
          hashtags: ['WorldCup2026', home.replace(/\s/g,''), away.replace(/\s/g,''), 'AIPrediction'],
        })

        // Max 3 match previews per run to avoid spamming
        if (tweets.filter(t => t.type === 'match_preview').length >= 3) break
      }
    }
    if (tweets.filter(t => t.type === 'match_preview').length >= 3) break
  }

  // --- 3. Tournament fact (if no matches soon) ---
  if (tweets.length === 0) {
    const facts = [
      'The 2026 World Cup features 48 teams for the first time! 🌍',
      'Matches across 16 venues in USA, Canada & Mexico 🇺🇸🇨🇦🇲🇽',
      'AI predicts Argentina as the pre-tournament favorite 🧠⚽',
    ]
    tweets.push({
      type: 'tournament_fact',
      content: `📊 World Cup 2026 Fact:\n\n${facts[Math.floor(Math.random() * facts.length)]}\n\nGet AI predictions →`,
      url: 'https://football.netown.cn/en/football',
      hashtags: ['WorldCup2026', 'Football', 'Stats'],
    })
  }

  return tweets
}
