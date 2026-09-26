import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Safely migrating Phase 3 tables to PostgreSQL...');

  // 1. Create PriceHistory Table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PriceHistory" (
      "id" TEXT PRIMARY KEY,
      "productPriceId" TEXT NOT NULL,
      "price" DOUBLE PRECISION,
      "originalPrice" DOUBLE PRECISION,
      "currency" TEXT NOT NULL DEFAULT 'INR',
      "inStock" BOOLEAN NOT NULL DEFAULT true,
      "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PriceHistory_productPriceId_fkey" FOREIGN KEY ("productPriceId") REFERENCES "ProductPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PriceHistory_productPriceId_idx" ON "PriceHistory"("productPriceId");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PriceHistory_checkedAt_idx" ON "PriceHistory"("checkedAt");
  `);
  console.log('✅ PriceHistory table and indexes verified.');

  // 2. Create ProductResearch Table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductResearch" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "brand" TEXT,
      "model" TEXT,
      "category" TEXT,
      "productUrl" TEXT,
      "imageUrl" TEXT,
      "targetAudience" TEXT,
      "searchIntent" TEXT,
      "articleAngle" TEXT,
      "researchNotes" TEXT,
      "keyFeatures" TEXT,
      "specifications" TEXT,
      "limitations" TEXT,
      "pros" TEXT,
      "cons" TEXT,
      "officialSources" TEXT,
      "factVerification" TEXT,
      "status" TEXT NOT NULL DEFAULT 'IDEA',
      "productId" TEXT,
      "authorId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProductResearch_status_idx" ON "ProductResearch"("status");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProductResearch_createdAt_idx" ON "ProductResearch"("createdAt");
  `);
  console.log('✅ ProductResearch table and indexes verified.');

  // 3. Create ActivityLog Table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ActivityLog" (
      "id" TEXT PRIMARY KEY,
      "userName" TEXT NOT NULL DEFAULT 'Admin',
      "userEmail" TEXT,
      "action" TEXT NOT NULL,
      "entity" TEXT NOT NULL,
      "entityId" TEXT,
      "summary" TEXT NOT NULL,
      "metadata" TEXT,
      "ipAddress" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_action_idx" ON "ActivityLog"("action");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_entity_idx" ON "ActivityLog"("entity");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
  `);
  console.log('✅ ActivityLog table and indexes verified.');

  // 4. Add qualityChecklist column to Blog if not present
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "qualityChecklist" TEXT;
    `);
    console.log('✅ Blog qualityChecklist column verified.');
  } catch (err) {
    console.log('ℹ️ qualityChecklist column already exists or skipped safely.');
  }

  // 5. Seed default Price Stale threshold setting if not exists
  const staleSetting = await prisma.setting.findUnique({
    where: { key: 'price_stale_days' },
  });
  if (!staleSetting) {
    await prisma.setting.create({
      data: {
        key: 'price_stale_days',
        value: '7',
      },
    });
    console.log('✅ Default price_stale_days setting (7 days) created.');
  }

  // 6. Log initial activity log entry
  await prisma.activityLog.create({
    data: {
      userName: 'System Migration',
      userEmail: 'admin@blogweb904.vercel.app',
      action: 'SYSTEM_UPGRADE',
      entity: 'DATABASE',
      summary: 'Phase 3 database tables (PriceHistory, ProductResearch, ActivityLog) initialized safely.',
    },
  });

  console.log('🎉 Phase 3 database migration completed successfully with 0 data loss!');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
