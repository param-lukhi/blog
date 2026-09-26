import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePhase9() {
  console.log('--- Migrating Phase 9 Tables ---');

  // PublishingTarget
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PublishingTarget" (
      "id" TEXT PRIMARY KEY,
      "period" TEXT UNIQUE NOT NULL DEFAULT 'DAILY',
      "targetCount" INTEGER NOT NULL DEFAULT 1,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ProductionQueueItem
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductionQueueItem" (
      "id" TEXT PRIMARY KEY,
      "topic" TEXT NOT NULL,
      "contentType" TEXT NOT NULL DEFAULT 'PRODUCT_REVIEW',
      "productId" TEXT,
      "searchIntent" TEXT,
      "sourceStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "researchStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "draftStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
      "seoStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "affiliateStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "status" TEXT NOT NULL DEFAULT 'IDEA',
      "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
      "dueDate" TIMESTAMP(3),
      "assignedTo" TEXT,
      "blogId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductionQueueItem_status_idx" ON "ProductionQueueItem"("status");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductionQueueItem_priority_idx" ON "ProductionQueueItem"("priority");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductionQueueItem_contentType_idx" ON "ProductionQueueItem"("contentType");`);

  // ResearchSnapshot
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ResearchSnapshot" (
      "id" TEXT PRIMARY KEY,
      "queueItemId" TEXT,
      "blogId" TEXT,
      "sources" TEXT NOT NULL,
      "verifiedFacts" TEXT NOT NULL,
      "unverifiedFacts" TEXT,
      "conflictingFacts" TEXT,
      "priceCheckDate" TIMESTAMP(3),
      "availabilityStatus" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ResearchSnapshot_blogId_idx" ON "ResearchSnapshot"("blogId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ResearchSnapshot_queueItemId_idx" ON "ResearchSnapshot"("queueItemId");`);

  // ContentVersion
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ContentVersion" (
      "id" TEXT PRIMARY KEY,
      "blogId" TEXT NOT NULL,
      "versionNumber" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "metaTitle" TEXT,
      "metaDescription" TEXT,
      "changeSummary" TEXT,
      "changedBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ContentVersion_blogId_idx" ON "ContentVersion"("blogId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ContentVersion_versionNumber_idx" ON "ContentVersion"("versionNumber");`);

  // IndexingStatus
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IndexingStatus" (
      "id" TEXT PRIMARY KEY,
      "url" TEXT UNIQUE NOT NULL,
      "canonical" TEXT,
      "inSitemap" BOOLEAN NOT NULL DEFAULT true,
      "robotsAllowed" BOOLEAN NOT NULL DEFAULT true,
      "gscState" TEXT NOT NULL DEFAULT 'UNKNOWN',
      "lastInspectedAt" TIMESTAMP(3),
      "lastVerifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "IndexingStatus_gscState_idx" ON "IndexingStatus"("gscState");`);

  console.log('✅ Phase 9 database migration completed successfully!');
  await prisma.$disconnect();
}

migratePhase9().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
