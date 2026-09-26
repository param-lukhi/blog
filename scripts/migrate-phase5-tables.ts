import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Phase 5 DB Safe Migration] Starting non-destructive migration check...');

  try {
    // 1. Create PriceAlert table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PriceAlert" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "storeSlug" TEXT NOT NULL DEFAULT 'amazon',
        "targetPrice" DOUBLE PRECISION NOT NULL,
        "currentPrice" DOUBLE PRECISION,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "token" TEXT NOT NULL,
        "isSubscribed" BOOLEAN NOT NULL DEFAULT true,
        "notifiedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PriceAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✓ "PriceAlert" table verified/created.');

    // 2. Create indexes individually
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "PriceAlert_token_key" ON "PriceAlert"("token");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceAlert_productId_idx" ON "PriceAlert"("productId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceAlert_status_idx" ON "PriceAlert"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PriceAlert_email_idx" ON "PriceAlert"("email");`);
    console.log('✓ "PriceAlert" indexes verified/created.');

    console.log('[Phase 5 DB Safe Migration] All migrations completed successfully.');
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
