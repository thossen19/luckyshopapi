import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Applies safe connection pool limits to the DATABASE_URL. Clever Cloud and
 * other low-cost MySQL hosts cap concurrent connections per user (often 5),
 * while Prisma's default pool (num_physical_cpus * 2 + 1) can exceed it and
 * cause "max_user_connections" errors during deploys or normal traffic.
 */
function buildDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/aisaasecommerce';
  const separator = raw.includes('?') ? '&' : '?';
  const params: string[] = [];
  if (!/connection_limit=/.test(raw)) params.push('connection_limit=2');
  if (!/pool_timeout=/.test(raw)) params.push('pool_timeout=15');
  return params.length ? `${raw}${separator}${params.join('&')}` : raw;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: buildDatabaseUrl(),
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

(prisma.$on as any)('error', (e: any) => {
  logger.error('Prisma error:', e);
});

export default prisma;
