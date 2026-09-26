import { prisma } from './prisma';

export interface DataIntegrityIssue {
  id: string;
  category: 'DUPLICATE_SLUG' | 'ORPHAN_PRICE' | 'ORPHAN_HISTORY' | 'ORPHAN_REVIEW' | 'ORPHAN_VERSION' | 'INVALID_RELATION';
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedTable: string;
  recordId: string;
  details: any;
  suggestedAction: string;
}

export interface DataIntegrityReport {
  timestamp: string;
  healthy: boolean;
  totalRecordsScanned: number;
  issueCount: number;
  issues: DataIntegrityIssue[];
  summary: string;
}

/**
 * Performs a comprehensive non-destructive data integrity audit across database tables
 */
export async function auditDataIntegrity(): Promise<DataIntegrityReport> {
  const issues: DataIntegrityIssue[] = [];
  let totalRecordsScanned = 0;

  // 1. Scan Products & Slugs
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, categoryId: true },
  });
  totalRecordsScanned += products.length;

  const productSlugs = new Map<string, string[]>();
  for (const p of products) {
    if (!productSlugs.has(p.slug)) {
      productSlugs.set(p.slug, []);
    }
    productSlugs.get(p.slug)!.push(p.id);
  }

  for (const [slug, ids] of productSlugs.entries()) {
    if (ids.length > 1) {
      issues.push({
        id: `dup-slug-prod-${slug}`,
        category: 'DUPLICATE_SLUG',
        description: `Multiple products (${ids.length}) share the same slug: "${slug}"`,
        severity: 'HIGH',
        affectedTable: 'Product',
        recordId: ids[0],
        details: { slug, productIds: ids },
        suggestedAction: 'Rename conflicting slugs to ensure unique URL routing.',
      });
    }
  }

  // 2. Scan Blogs & Slugs
  const blogs = await prisma.blog.findMany({
    select: { id: true, title: true, slug: true },
  });
  totalRecordsScanned += blogs.length;

  const blogSlugs = new Map<string, string[]>();
  for (const b of blogs) {
    if (!blogSlugs.has(b.slug)) {
      blogSlugs.set(b.slug, []);
    }
    blogSlugs.get(b.slug)!.push(b.id);
  }

  for (const [slug, ids] of blogSlugs.entries()) {
    if (ids.length > 1) {
      issues.push({
        id: `dup-slug-blog-${slug}`,
        category: 'DUPLICATE_SLUG',
        description: `Multiple blogs (${ids.length}) share the same slug: "${slug}"`,
        severity: 'HIGH',
        affectedTable: 'Blog',
        recordId: ids[0],
        details: { slug, blogIds: ids },
        suggestedAction: 'Update duplicate blog slug.',
      });
    }
  }

  // 3. Scan for Orphan Prices
  const prices = await prisma.productPrice.findMany({
    select: { id: true, productId: true, storeSlug: true, price: true },
  });
  totalRecordsScanned += prices.length;

  const validProductIds = new Set(products.map((p) => p.id));
  for (const price of prices) {
    if (!validProductIds.has(price.productId)) {
      issues.push({
        id: `orphan-price-${price.id}`,
        category: 'ORPHAN_PRICE',
        description: `ProductPrice ${price.id} points to non-existent productId "${price.productId}"`,
        severity: 'HIGH',
        affectedTable: 'ProductPrice',
        recordId: price.id,
        details: { priceId: price.id, productId: price.productId },
        suggestedAction: 'Review and remove orphan pricing record.',
      });
    }
  }

  // 4. Scan for Orphan Price Histories
  const priceHistories = await prisma.priceHistory.findMany({
    select: { id: true, productPriceId: true },
  });
  totalRecordsScanned += priceHistories.length;

  const validPriceIds = new Set(prices.map((p) => p.id));
  for (const ph of priceHistories) {
    if (!validPriceIds.has(ph.productPriceId)) {
      issues.push({
        id: `orphan-history-${ph.id}`,
        category: 'ORPHAN_HISTORY',
        description: `PriceHistory ${ph.id} points to non-existent productPriceId "${ph.productPriceId}"`,
        severity: 'MEDIUM',
        affectedTable: 'PriceHistory',
        recordId: ph.id,
        details: { historyId: ph.id, productPriceId: ph.productPriceId },
        suggestedAction: 'Remove detached price history entries.',
      });
    }
  }

  // 5. Scan for Orphan Reviews
  const reviews = await prisma.productReview.findMany({
    select: { id: true, productId: true, title: true },
  });
  totalRecordsScanned += reviews.length;

  for (const rev of reviews) {
    if (!validProductIds.has(rev.productId)) {
      issues.push({
        id: `orphan-review-${rev.id}`,
        category: 'ORPHAN_REVIEW',
        description: `ProductReview ${rev.id} references deleted product "${rev.productId}"`,
        severity: 'MEDIUM',
        affectedTable: 'ProductReview',
        recordId: rev.id,
        details: { reviewId: rev.id, productId: rev.productId },
        suggestedAction: 'Clean up orphaned review or re-link to active product.',
      });
    }
  }

  // 6. Scan for Orphan Content Versions
  const versions = await prisma.contentVersion.findMany({
    select: { id: true, blogId: true, versionNumber: true },
  });
  totalRecordsScanned += versions.length;

  const validBlogIds = new Set(blogs.map((b) => b.id));
  for (const v of versions) {
    if (!validBlogIds.has(v.blogId)) {
      issues.push({
        id: `orphan-version-${v.id}`,
        category: 'ORPHAN_VERSION',
        description: `ContentVersion ${v.id} (v${v.versionNumber}) belongs to non-existent blog "${v.blogId}"`,
        severity: 'LOW',
        affectedTable: 'ContentVersion',
        recordId: v.id,
        details: { versionId: v.id, blogId: v.blogId },
        suggestedAction: 'Purge orphan versions for deleted blogs.',
      });
    }
  }

  const issueCount = issues.length;
  const healthy = issueCount === 0;

  return {
    timestamp: new Date().toISOString(),
    healthy,
    totalRecordsScanned,
    issueCount,
    issues,
    summary: healthy
      ? `Data integrity verified across ${totalRecordsScanned} records. Zero orphaned relations or duplicate slugs found.`
      : `Found ${issueCount} integrity issue(s) across ${totalRecordsScanned} scanned records. Admin review required before safe cleanup.`,
  };
}
