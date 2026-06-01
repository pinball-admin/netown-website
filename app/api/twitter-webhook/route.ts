import { NextResponse } from 'next/server'

export interface TweetTemplate {
  id: string
  type: 'master_prediction' | 'ai_streak' | 'user_win' | 'daily_summary'
  content: string
  url: string
  hashtags: string[]
}

export async function POST(request: Request) {
  const { type, data } = await request.json()

  let tweet: TweetTemplate

  switch (type) {
    case 'master_prediction':
      tweet = {
        id: `tweet-${Date.now()}`,
        type: 'master_prediction',
        content: `🏆 Master Predictor Alert! 🧠\n\n${data.userName} just nailed another perfect prediction! 🔥\n\n${data.match}: ${data.prediction} ✓\nAccuracy: ${data.accuracy}%\n\nSee all predictions →`,
        url: `https://football.netown.cn/team-${data.teamSlug}`,
        hashtags: ['WorldCup2026', 'AIPrediction', 'Football', 'MasterPredictor']
      }
      break

    case 'ai_streak':
      tweet = {
        id: `tweet-${Date.now()}`,
        type: 'ai_streak',
        content: `🤖 AI神算子 ${data.streak} 连红！\n\n${data.expertName} continues its unstoppable streak!\n\n${data.matchResult}\n\nCurrent streak: ${data.streak} wins in a row! 🚀\n\nCheck the leaderboard →`,
        url: 'https://football.netown.cn/football',
        hashtags: ['AI', 'WorldCup', 'FootballPredictions', 'DataScience']
      }
      break

    case 'user_win':
      tweet = {
        id: `tweet-${Date.now()}`,
        type: 'user_win',
        content: `🎉 New Master Predictor! 🎉\n\nCongratulations @${data.userName}!\n\n${data.correctPredictions}/${data.totalPredictions} predictions\n${data.accuracy}% accuracy\n\nEarned ${data.candyEarned} 🍬\n\nJoin the competition →`,
        url: 'https://football.netown.cn/teams',
        hashtags: ['WorldCup2026', 'FantasyFootball', 'Predictions', 'MasterClass']
      }
      break

    case 'daily_summary':
      tweet = {
        id: `tweet-${Date.now()}`,
        type: 'daily_summary',
        content: `📊 Today's Top Performers 🏅\n\n🥇 ${data.rank1}\n🥈 ${data.rank2}\n🥉 ${data.rank3}\n\n${data.totalPredictions} predictions today\n${data.correctRate}% correct\n\nFull stats →`,
        url: 'https://football.netown.cn/football',
        hashtags: ['WorldCup2026', 'FootballStats', 'DailyRecap', 'Predictions']
      }
      break

    default:
      return NextResponse.json({ success: false, message: 'Unknown tweet type' }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    tweet,
    fullText: `${tweet.content}\n${tweet.url}\n${tweet.hashtags.map(h => `#${h}`).join(' ')}`
  })
}

export async function GET() {
  const examples: TweetTemplate[] = [
    {
      id: 'example-1',
      type: 'master_prediction',
      content: '🏆 Master Predictor Alert! 🧠\n\nJohn_Doe just nailed another perfect prediction! 🔥\n\nArgentina vs Brazil: 2-1 ✓\nAccuracy: 85%\n\nSee all predictions →',
      url: 'https://football.netown.cn/team-argentina',
      hashtags: ['WorldCup2026', 'AIPrediction', 'Football', 'MasterPredictor']
    },
    {
      id: 'example-2',
      type: 'ai_streak',
      content: '🤖 AI神算子 5 连红！\n\nNeuralNetMaster continues its unstoppable streak!\n\nFrance 3-0 Germany\n\nCurrent streak: 5 wins in a row! 🚀\n\nCheck the leaderboard →',
      url: 'https://football.netown.cn/football',
      hashtags: ['AI', 'WorldCup', 'FootballPredictions', 'DataScience']
    }
  ]

  return NextResponse.json({ success: true, examples })
}
