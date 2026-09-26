import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Phase 6 DB Safe Migration] Starting non-destructive migration check...');

  try {
    // 1. Create AffiliateConversion table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AffiliateConversion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "storeSlug" TEXT NOT NULL,
        "externalTransactionId" TEXT,
        "productId" TEXT,
        "blogId" TEXT,
        "clickId" TEXT,
        "amount" DOUBLE PRECISION,
        "commission" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'INR',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ "AffiliateConversion" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateConversion_externalTransactionId_key" ON "AffiliateConversion"("externalTransactionId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AffiliateConversion_status_idx" ON "AffiliateConversion"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AffiliateConversion_storeSlug_idx" ON "AffiliateConversion"("storeSlug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AffiliateConversion_productId_idx" ON "AffiliateConversion"("productId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AffiliateConversion_blogId_idx" ON "AffiliateConversion"("blogId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AffiliateConversion_convertedAt_idx" ON "AffiliateConversion"("convertedAt");`);
    console.log('✓ "AffiliateConversion" indexes verified/created.');

    // 2. Create ProductReview table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductReview" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "email" TEXT,
        "userEmailHash" TEXT,
        "rating" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "isVerifiedBuyer" BOOLEAN NOT NULL DEFAULT false,
        "moderatedAt" TIMESTAMP(3),
        "moderatedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✓ "ProductReview" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductReview_productId_status_idx" ON "ProductReview"("productId", "status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductReview_status_idx" ON "ProductReview"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductReview_createdAt_idx" ON "ProductReview"("createdAt");`);
    console.log('✓ "ProductReview" indexes verified/created.');

    // 3. Create ReviewReport table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReviewReport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reviewId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "details" TEXT,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "reporterIpHash" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✓ "ReviewReport" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReviewReport_status_idx" ON "ReviewReport"("status");`);
    console.log('✓ "ReviewReport" indexes verified/created.');

    // 4. Create NewsletterDigest table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsletterDigest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "previewText" TEXT,
        "contentHtml" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "metrics" TEXT,
        "recipientCount" INTEGER NOT NULL DEFAULT 0,
        "sentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ "NewsletterDigest" table verified/created.');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "NewsletterDigest_status_idx" ON "NewsletterDigest"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "NewsletterDigest_createdAt_idx" ON "NewsletterDigest"("createdAt");`);
    console.log('✓ "NewsletterDigest" indexes verified/created.');

    // 5. Safely check / add columns to NewsletterSubscriber if missing
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='NewsletterSubscriber' AND column_name='preferences') THEN
          ALTER TABLE "NewsletterSubscriber" ADD COLUMN "preferences" TEXT NOT NULL DEFAULT 'reviews,drops,comparisons,digest';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='NewsletterSubscriber' AND column_name='token') THEN
          ALTER TABLE "NewsletterSubscriber" ADD COLUMN "token" TEXT;
          UPDATE "NewsletterSubscriber" SET "token" = 'tok_' || md5(random()::text || clock_timestamp()::text) WHERE "token" IS NULL;
          ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "token" SET NOT NULL;
          CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_token_key" ON "NewsletterSubscriber"("token");
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='NewsletterSubscriber' AND column_name='updatedAt') THEN
          ALTER TABLE "NewsletterSubscriber" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);
    console.log('✓ "NewsletterSubscriber" columns & token verified.');

    console.log('[Phase 6 DB Safe Migration] All migrations completed successfully.');
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
