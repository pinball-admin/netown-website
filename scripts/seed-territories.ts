import { prisma } from '../libs/prisma/client'

const TEAM_CODES = [
  'MEX', 'KOR', 'CZE', 'RSA', 'CAN', 'BIH', 'QAT', 'SUI',
  'BRA', 'MAR', 'HAI', 'SCO', 'USA', 'PAR', 'AUS', 'TUR',
  'GER', 'CUW', 'ECU', 'CIV', 'NED', 'JPN', 'SWE', 'TUN',
  'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV', 'KSA', 'URU',
  'FRA', 'SEN', 'IRQ', 'NOR', 'ARG', 'ALG', 'AUT', 'JOR',
  'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN',
]

async function seedTerritories() {
  console.log(`Seeding ${TEAM_CODES.length} territories...`)

  for (const code of TEAM_CODES) {
    await prisma.territory.upsert({
      where: { teamCode: code },
      update: {},
      create: { teamCode: code },
    })
  }

  console.log(`✅ Seeded ${TEAM_CODES.length} territories successfully`)
}

seedTerritories()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
