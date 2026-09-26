import { prisma } from './prisma';

export interface IndexingIssue {
  id: string;
  url: string;
  type: 'BLOG' | 'PRODUCT' | 'CATEGORY' | 'STATIC';
  issue: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  gscState: string;
  inSitemap: boolean;
  robotsAllowed: boolean;
  detectedAt: string;
  suggestedAction: string;
}

/**
 * Discovers and reports actual Google Indexing issues across catalog and content
 */
export async function auditIndexingIssues(): Promise<{
  totalChecked: number;
  healthyCount: number;
  issueCount: number;
  issues: IndexingIssue[];
}> {
  const issues: IndexingIssue[] = [];
  const baseCanonical = process.env.NEXT_PUBLIC_APP_URL || 'https://blogweb904.vercel.app';
  const now = new Date().toISOString();

  // 1. Audit Published Blogs
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true, updatedAt: true },
  });

  // Fetch all known indexing statuses
  const indexingRecords = await prisma.indexingStatus.findMany();
  const indexingMap = new Map(indexingRecords.map((r) => [r.url, r]));

  for (const blog of blogs) {
    const publicUrl = `${baseCanonical}/blog/${blog.slug}`;
    const statusRecord = indexingMap.get(publicUrl);
    const gscState = statusRecord ? statusRecord.gscState : 'UNKNOWN';
    const inSitemap = statusRecord ? statusRecord.inSitemap : true;
    const robotsAllowed = statusRecord ? statusRecord.robotsAllowed : true;

    // Check 1: Missing metadata
    if (!blog.metaTitle || !blog.metaDescription) {
      issues.push({
        id: `blog-meta-${blog.id}`,
        url: publicUrl,
        type: 'BLOG',
        issue: 'Missing Meta Title or Meta Description',
        severity: 'WARNING',
        gscState,
        inSitemap,
        robotsAllowed,
        detectedAt: now,
        suggestedAction: 'Add meta title (50-60 chars) and compelling meta description in blog editor.',
      });
    }

    // Check 2: Crawled not indexed
    if (gscState === 'CRAWLED_NOT_INDEXED') {
      issues.push({
        id: `blog-cni-${blog.id}`,
        url: publicUrl,
        type: 'BLOG',
        issue: 'Google Crawled URL but did not index',
        severity: 'CRITICAL',
        gscState,
        inSitemap,
        robotsAllowed,
        detectedAt: now,
        suggestedAction: 'Enhance content depth, add verified primary sources, and request re-indexing.',
      });
    }

    // Check 4: Excluded
    if (gscState === 'EXCLUDED') {
      issues.push({
        id: `blog-exc-${blog.id}`,
        url: publicUrl,
        type: 'BLOG',
        issue: 'Google Excluded URL from index',
        severity: 'CRITICAL',
        gscState,
        inSitemap,
        robotsAllowed,
        detectedAt: now,
        suggestedAction: 'Inspect URL in Google Search Console to view Google-provided exclusion reason.',
      });
    }

    // Check 5: Robots disallowed
    if (!robotsAllowed) {
      issues.push({
        id: `blog-robots-${blog.id}`,
        url: publicUrl,
        type: 'BLOG',
        issue: 'Blocked by robots.txt directive',
        severity: 'CRITICAL',
        gscState,
        inSitemap,
        robotsAllowed,
        detectedAt: now,
        suggestedAction: 'Check robots.txt rules to ensure public blog routes are crawlable.',
      });
    }
  }

  // 2. Audit Published Products
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, name: true, slug: true, price: true, amazonUrl: true },
  });

  for (const product of products) {
    const publicUrl = `${baseCanonical}/product/${product.slug}`;
    const statusRecord = indexingMap.get(publicUrl);
    const gscState = statusRecord ? statusRecord.gscState : 'UNKNOWN';

    if (!product.price || product.price === '0') {
      issues.push({
        id: `prod-price-${product.id}`,
        url: publicUrl,
        type: 'PRODUCT',
        issue: 'Missing price information on published product',
        severity: 'WARNING',
        gscState,
        inSitemap: true,
        robotsAllowed: true,
        detectedAt: now,
        suggestedAction: 'Verify store prices in Product Manager to ensure pricing schema is valid.',
      });
    }
  }

  const totalChecked = blogs.length + products.length;
  const issueCount = issues.length;
  const healthyCount = Math.max(0, totalChecked - issueCount);

  return {
    totalChecked,
    healthyCount,
    issueCount,
    issues,
  };
}
