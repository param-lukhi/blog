import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Phase 4 DB Safe Migration] Starting non-destructive migration check...');

  try {
    // 1. Create PriceSyncLog table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PriceSyncLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "runId" TEXT NOT NULL,
        "storeSlug" TEXT NOT NULL,
        "storeName" TEXT,
        "status" TEXT NOT NULL DEFAULT 'RUNNING',
        "productsChecked" INTEGER NOT NULL DEFAULT 0,
        "productsUpdated" INTEGER NOT NULL DEFAULT 0,
        "productsFailed" INTEGER NOT NULL DEFAULT 0,
        "errors" TEXT,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP(3)
      );
    `);
    console.log('✓ "PriceSyncLog" table verified/created.');

    // 2. Create indexes individually
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceSyncLog_runId_idx" ON "PriceSyncLog"("runId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceSyncLog_storeSlug_idx" ON "PriceSyncLog"("storeSlug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceSyncLog_status_idx" ON "PriceSyncLog"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceSyncLog_startedAt_idx" ON "PriceSyncLog"("startedAt");`);
    console.log('✓ "PriceSyncLog" individual indexes verified/created.');

    console.log('[Phase 4 DB Safe Migration] All migrations completed successfully.');
  } catch (error: any) {
    console.error('Migration error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Safe migration failed:', err);
  process.exit(1);
});
