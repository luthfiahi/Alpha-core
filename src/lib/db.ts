import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Automatically appends ?pgbouncer=true when using Supabase Transaction Pooler.
 * This prevents "prepared statement already exists" errors with PgBouncer.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? ''
  if (url.includes('pooler.supabase.com') && !url.includes('pgbouncer=true')) {
    return `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`
  }
  return url
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
    // In development, log errors and warnings; in production, only errors
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
