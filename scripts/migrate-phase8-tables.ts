import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePhase8() {
  console.log('--- Migrating Phase 8 Tables ---');

  // SearchPerformance
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SearchPerformance" (
      "id" TEXT PRIMARY KEY,
      "date" TIMESTAMP(3) NOT NULL,
      "query" TEXT NOT NULL,
      "page" TEXT NOT NULL,
      "clicks" INTEGER NOT NULL DEFAULT 0,
      "impressions" INTEGER NOT NULL DEFAULT 0,
      "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "country" TEXT DEFAULT 'global',
      "device" TEXT DEFAULT 'desktop',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SearchPerformance_date_query_page_country_device_key" ON "SearchPerformance"("date", "query", "page", "country", "device");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchPerformance_query_idx" ON "SearchPerformance"("query");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchPerformance_page_idx" ON "SearchPerformance"("page");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchPerformance_date_idx" ON "SearchPerformance"("date");`);

  // ContentOpportunity
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ContentOpportunity" (
      "id" TEXT PRIMARY KEY,
      "topic" TEXT NOT NULL,
      "opportunityType" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "evidence" TEXT NOT NULL,
      "relatedExistingContent" TEXT,
      "suggestedSearchIntent" TEXT,
      "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
      "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
      "assignedDate" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ContentOpportunity_opportunityType_idx" ON "ContentOpportunity"("opportunityType");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ContentOpportunity_priority_idx" ON "ContentOpportunity"("priority");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ContentOpportunity_status_idx" ON "ContentOpportunity"("status");`);

  // InternalLinkSuggestion
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "InternalLinkSuggestion" (
      "id" TEXT PRIMARY KEY,
      "sourceUrl" TEXT NOT NULL,
      "sourceTitle" TEXT,
      "targetUrl" TEXT NOT NULL,
      "targetTitle" TEXT,
      "suggestedAnchor" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "InternalLinkSuggestion_sourceUrl_idx" ON "InternalLinkSuggestion"("sourceUrl");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "InternalLinkSuggestion_targetUrl_idx" ON "InternalLinkSuggestion"("targetUrl");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "InternalLinkSuggestion_status_idx" ON "InternalLinkSuggestion"("status");`);

  // FactCheckClaim
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FactCheckClaim" (
      "id" TEXT PRIMARY KEY,
      "contentId" TEXT,
      "claimText" TEXT NOT NULL,
      "sourceUrl" TEXT,
      "sourceType" TEXT,
      "status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
      "notes" TEXT,
      "verifiedBy" TEXT,
      "verifiedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FactCheckClaim_status_idx" ON "FactCheckClaim"("status");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FactCheckClaim_contentId_idx" ON "FactCheckClaim"("contentId");`);

  // GrowthExperiment
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GrowthExperiment" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "hypothesis" TEXT NOT NULL,
      "targetMetric" TEXT NOT NULL,
      "variants" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "results" TEXT,
      "winnerVariant" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "GrowthExperiment_status_idx" ON "GrowthExperiment"("status");`);

  // AiUsageLog
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AiUsageLog" (
      "id" TEXT PRIMARY KEY,
      "provider" TEXT NOT NULL,
      "model" TEXT NOT NULL,
      "feature" TEXT NOT NULL,
      "requestCount" INTEGER NOT NULL DEFAULT 1,
      "promptTokens" INTEGER,
      "completionTokens" INTEGER,
      "totalTokens" INTEGER,
      "estimatedCost" DOUBLE PRECISION,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AiUsageLog_provider_idx" ON "AiUsageLog"("provider");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AiUsageLog_feature_idx" ON "AiUsageLog"("feature");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AiUsageLog_createdAt_idx" ON "AiUsageLog"("createdAt");`);

  console.log('✅ Phase 8 database migration completed successfully!');
  await prisma.$disconnect();
}

migratePhase8().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});
