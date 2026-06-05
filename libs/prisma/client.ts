import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL || 'file:./dev.db'

let prisma: PrismaClient

function createClient() {
  if (url.startsWith('file:')) {
    // Local SQLite
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const adapter = new PrismaBetterSqlite3({ url })
    return new PrismaClient({ adapter })
  } else if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    // Production PostgreSQL (Neon)
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const { Pool } = require('@neondatabase/serverless')
    const pool = new Pool({ connectionString: url })
    return new PrismaClient({ adapter: new PrismaNeon(pool) })
  }
  return new PrismaClient()
}

if (process.env.NODE_ENV === 'production') {
  prisma = createClient()
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = createClient()
  }
  prisma = (global as any).prisma
}

export { prisma }
