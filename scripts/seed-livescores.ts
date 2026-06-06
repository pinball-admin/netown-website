import { prisma } from '@/libs/prisma/client'
import { getMockMatchSchedule } from '@/libs/services/wheniskickoff'

async function seedLiveScores() {
  console.log('[Seed-LiveScores] Starting...')

  const matches = getMockMatchSchedule()
  let created = 0

  for (const match of matches) {
    const homeCode = match.homeTeam.shortName || match.homeTeam.id
    const awayCode = match.awayTeam.shortName || match.awayTeam.id

    try {
      await prisma.liveMatch.upsert({
        where: {
          homeTeam_awayTeam: {
            homeTeam: homeCode,
            awayTeam: awayCode,
          },
        },
        create: {
          id: match.id,
          homeTeam: homeCode,
          awayTeam: awayCode,
          homeScore: match.score?.home ?? 0,
          awayScore: match.score?.away ?? 0,
          status: match.status,
          round: match.round,
        },
        update: {
          homeScore: match.score?.home ?? 0,
          awayScore: match.score?.away ?? 0,
          status: match.status,
          round: match.round,
        },
      })
      created++
    } catch (e: any) {
      console.warn(`[Seed-LiveScores] Skipped ${homeCode} vs ${awayCode}: ${e.message}`)
    }
  }

  console.log(`[Seed-LiveScores] Done. ${created}/${matches.length} matches seeded.`)
  await prisma.$disconnect()
}

seedLiveScores().catch((e) => {
  console.error('[Seed-LiveScores] Failed:', e)
  process.exit(1)
})
