import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Phase 7 DB Safe Migration] Starting non-destructive migration check...');

  try {
    // 1. Create JobLog table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "JobLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "jobName" TEXT NOT NULL,
        "runId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'RUNNING',
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP(3),
        "durationMs" INTEGER,
        "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
        "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
        "errorCount" INTEGER NOT NULL DEFAULT 0,
        "errors" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ "JobLog" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "JobLog_jobName_idx" ON "JobLog"("jobName");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "JobLog_runId_idx" ON "JobLog"("runId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "JobLog_status_idx" ON "JobLog"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "JobLog_startedAt_idx" ON "JobLog"("startedAt");`);
    console.log('✓ "JobLog" indexes verified/created.');

    // 2. Create EmailDeliveryLog table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EmailDeliveryLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "newsletterId" TEXT,
        "provider" TEXT NOT NULL,
        "recipientEmail" TEXT,
        "status" TEXT NOT NULL,
        "error" TEXT,
        "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ "EmailDeliveryLog" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailDeliveryLog_status_idx" ON "EmailDeliveryLog"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EmailDeliveryLog_sentAt_idx" ON "EmailDeliveryLog"("sentAt");`);
    console.log('✓ "EmailDeliveryLog" indexes verified/created.');

    // 3. Create SeoIssue table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SeoIssue" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "entityType" TEXT NOT NULL,
        "entityId" TEXT,
        "entityUrl" TEXT,
        "issueType" TEXT NOT NULL,
        "severity" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "message" TEXT NOT NULL,
        "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolvedAt" TIMESTAMP(3)
      );
    `);
    console.log('✓ "SeoIssue" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SeoIssue_severity_idx" ON "SeoIssue"("severity");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SeoIssue_status_idx" ON "SeoIssue"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SeoIssue_issueType_idx" ON "SeoIssue"("issueType");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SeoIssue_detectedAt_idx" ON "SeoIssue"("detectedAt");`);
    console.log('✓ "SeoIssue" indexes verified/created.');

    // 4. Create SystemErrorLog table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemErrorLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "severity" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "stack" TEXT,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "requestPath" TEXT,
        "runId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ "SystemErrorLog" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SystemErrorLog_severity_idx" ON "SystemErrorLog"("severity");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SystemErrorLog_source_idx" ON "SystemErrorLog"("source");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SystemErrorLog_status_idx" ON "SystemErrorLog"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SystemErrorLog_createdAt_idx" ON "SystemErrorLog"("createdAt");`);
    console.log('✓ "SystemErrorLog" indexes verified/created.');

    console.log('[Phase 7 DB Safe Migration] All migrations completed successfully.');
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
