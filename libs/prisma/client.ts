import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL || 'file:./dev.db'

let _prisma: PrismaClient | null = null

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

function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = createClient()
  }
  return _prisma
}

// Lazy proxy: delays PrismaClient instantiation until first use
// This prevents build-time failures when database is unreachable
const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as any)[prop]
  },
})

export { prisma }
