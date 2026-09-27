import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('--- Migrating ProductResearch blogId column ---');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ProductResearch" ADD COLUMN IF NOT EXISTS "blogId" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProductResearch_blogId_idx" ON "ProductResearch"("blogId");
  `);
  console.log('✅ ProductResearch blogId column and index verified.');
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
