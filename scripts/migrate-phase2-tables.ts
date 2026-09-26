import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPhase2TablesSafely() {
  console.log('🔄 Executing non-destructive table creation for Phase 2...');

  try {
    // 1. Create ProductPrice table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductPrice" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "storeName" TEXT NOT NULL,
        "storeSlug" TEXT NOT NULL,
        "price" DOUBLE PRECISION,
        "originalPrice" DOUBLE PRECISION,
        "currency" TEXT NOT NULL DEFAULT 'INR',
        "discount" DOUBLE PRECISION,
        "inStock" BOOLEAN NOT NULL DEFAULT true,
        "couponCode" TEXT,
        "offerText" TEXT,
        "productUrl" TEXT,
        "affiliateUrl" TEXT,
        "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Created or verified "ProductPrice" table.');

    // 2. Create ProductPrice indexes if not exist
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductPrice_productId_idx" ON "ProductPrice"("productId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductPrice_storeSlug_idx" ON "ProductPrice"("storeSlug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductPrice_productId_storeSlug_idx" ON "ProductPrice"("productId", "storeSlug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductPrice_lastCheckedAt_idx" ON "ProductPrice"("lastCheckedAt");`);
    console.log('✅ Created indexes on "ProductPrice".');

    // 3. Create Store table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Store" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "domain" TEXT,
        "logo" TEXT,
        "affiliateTag" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Store_name_key" ON "Store"("name");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Store_slug_key" ON "Store"("slug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Store_slug_idx" ON "Store"("slug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");`);
    console.log('✅ Created or verified "Store" table.');

    // 4. Seed default supported stores if empty
    const defaultStores = [
      { name: 'Amazon India', slug: 'amazon', domain: 'amazon.in', logo: '🛒' },
      { name: 'Flipkart', slug: 'flipkart', domain: 'flipkart.com', logo: '🛍️' },
      { name: 'Croma Electronics', slug: 'croma', domain: 'croma.com', logo: '⚡' },
      { name: 'Reliance Digital', slug: 'reliance', domain: 'reliancedigital.in', logo: '📱' },
      { name: 'Official Brand Store', slug: 'brand-store', domain: '', logo: '🏢' },
      { name: 'Tata CLiQ', slug: 'tatacliq', domain: 'tatacliq.com', logo: '🏷️' },
    ];

    for (const store of defaultStores) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Store" ("id", "name", "slug", "domain", "logo", "isActive", "createdAt", "updatedAt")
        VALUES (
          'store_' || '${store.slug}',
          '${store.name}',
          '${store.slug}',
          '${store.domain}',
          '${store.logo}',
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT ("slug") DO UPDATE SET
          "name" = EXCLUDED."name",
          "domain" = EXCLUDED."domain",
          "logo" = EXCLUDED."logo",
          "updatedAt" = CURRENT_TIMESTAMP;
      `);
    }
    console.log('✅ Seeded default stores.');

    // 5. Safe Migration: If any products have JSON marketplaces, parse and seed into ProductPrice
    const products = await prisma.product.findMany();
    console.log(`🔍 Found ${products.length} existing products in database.`);

    for (const prod of products) {
      if (prod.marketplaces && typeof prod.marketplaces === 'string') {
        try {
          const parsed = JSON.parse(prod.marketplaces);
          if (parsed && typeof parsed === 'object') {
            for (const [key, val] of Object.entries(parsed)) {
              if (val && typeof val === 'object') {
                const storeData: any = val;
                const storeName = storeData.marketplace || storeData.country || key;
                const storeSlug = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const rawPrice = storeData.price ? parseFloat(String(storeData.price).replace(/[^0-9.]/g, '')) : null;

                const existingPrice = await prisma.productPrice.findFirst({
                  where: { productId: prod.id, storeSlug },
                });

                if (!existingPrice && rawPrice) {
                  await prisma.productPrice.create({
                    data: {
                      productId: prod.id,
                      storeName: String(storeName),
                      storeSlug,
                      price: rawPrice,
                      currency: storeData.currency || 'INR',
                      productUrl: storeData.url || prod.amazonUrl,
                      affiliateUrl: storeData.url || prod.affiliateUrl,
                      inStock: storeData.availability ? storeData.availability.toLowerCase().includes('in stock') : true,
                    },
                  });
                  console.log(`  ↳ Migrated price for "${prod.name}" (${storeName}: ${rawPrice})`);
                }
              }
            }
          }
        } catch (_) {}
      }
    }

    console.log('🎉 Phase 2 Database Non-Destructive Migration Completed Successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createPhase2TablesSafely();
