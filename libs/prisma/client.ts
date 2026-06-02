import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  })
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL || "file:./dev.db",
    })
  }
  prisma = (global as any).prisma
}

export { prisma }