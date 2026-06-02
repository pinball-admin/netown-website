import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/netown'
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter })
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({ adapter })
  }
  prisma = (global as any).prisma
}

export { prisma }