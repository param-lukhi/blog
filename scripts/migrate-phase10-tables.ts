import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔄 Applying Phase 10 non-destructive database migrations to PostgreSQL...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Incident" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
      "status" TEXT NOT NULL DEFAULT 'OPEN',
      "affectedSystem" TEXT NOT NULL,
      "rootCause" TEXT,
      "resolution" TEXT,
      "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "resolvedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    );
  `);
  console.log('✅ Incident table verified/created');

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Incident_affectedSystem_idx" ON "Incident"("affectedSystem");
  `);
  console.log('✅ Incident indexes created');

  console.log('🎉 Phase 10 migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
