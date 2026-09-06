import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const FAILED_MIGRATION = '20260904182122_add_custom_pages';

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function tableExists(name) {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*) AS c FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = ${name}
  `;
  return Number(rows[0].c) > 0;
}

async function findFailedMigration(name) {
  return prisma.$queryRaw`
    SELECT migration_name FROM _prisma_migrations
    WHERE finished_at IS NULL AND rolled_back_at IS NULL AND migration_name = ${name}
    LIMIT 1
  `;
}

async function repairFailedMigrations() {
  for (const name of [FAILED_MIGRATION]) {
    const failed = await findFailedMigration(name);
    if (!failed.length) continue;

    const customPagesCreated = await tableExists('custom_pages');
    const flag = customPagesCreated ? '--applied' : '--rolled-back';
    console.log(`Repairing failed migration ${name} (${flag})...`);
    execSync(`npx prisma migrate resolve ${flag} ${name}`, { stdio: 'inherit' });
  }
}

async function main() {
  try {
    await repairFailedMigrations();
  } finally {
    await prisma.$disconnect();
  }

  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  await import('../dist/server.js');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});