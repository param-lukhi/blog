import prisma from '@/lib/prisma';

export interface DiscoveredOpportunity {
  topic: string;
  opportunityType: 'NEW_ARTICLE' | 'UPDATE_ARTICLE' | 'COMPARISON' | 'PRODUCT_REVIEW' | 'BUYING_GUIDE' | 'FAQ' | 'INTERNAL_LINK';
  reason: string;
  evidence: string;
  relatedExistingContent?: string;
  suggestedSearchIntent: 'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Rules-based engine that discovers content and cluster opportunities from real database state.
 */
export async function discoverContentOpportunities(): Promise<DiscoveredOpportunity[]> {
  const opportunities: DiscoveredOpportunity[] = [];

  // 1. Category gaps: Find categories lacking comparisons or buying guides
  const categories = await prisma.category.findMany({
    include: {
      products: { select: { id: true, name: true, slug: true } },
      blogs: { select: { id: true, title: true, slug: true } },
    },
  });

  const comparisons = await prisma.comparison.findMany({
    select: { id: true, title: true, slug: true },
  });

  for (const cat of categories) {
    if (cat.products.length >= 2) {
      const hasComparison = comparisons.some(c => c.title.toLowerCase().includes(cat.name.toLowerCase()));
      if (!hasComparison) {
        opportunities.push({
          topic: `Top ${cat.name} Comparison: ${cat.products[0].name} vs ${cat.products[1].name}`,
          opportunityType: 'COMPARISON',
          reason: `Category "${cat.name}" has ${cat.products.length} products but zero published comparison guides.`,
          evidence: `Catalog contains ${cat.products.map(p => p.name).join(', ')} without head-to-head comparison page.`,
          relatedExistingContent: cat.name,
          suggestedSearchIntent: 'COMMERCIAL',
          priority: 'HIGH',
        });
      }
    }

    if (cat.blogs.length === 0 && cat.products.length > 0) {
      opportunities.push({
        topic: `Ultimate Buying Guide: How to Choose the Best ${cat.name} in 2026`,
        opportunityType: 'BUYING_GUIDE',
        reason: `Category "${cat.name}" has active products but no comprehensive buying guide pillar.`,
        evidence: `Category product count: ${cat.products.length}, Published articles: 0`,
        relatedExistingContent: cat.name,
        suggestedSearchIntent: 'COMMERCIAL',
        priority: 'HIGH',
      });
    }
  }

  // 2. High-impression Search Console opportunities
  const highImpressionQueries = await prisma.searchPerformance.findMany({
    where: { impressions: { gte: 100 }, position: { gte: 8 } },
    take: 10,
  });

  for (const q of highImpressionQueries) {
    opportunities.push({
      topic: `Comprehensive Guide: ${q.query}`,
      opportunityType: 'NEW_ARTICLE',
      reason: `High organic impression volume (${q.impressions}) on position ${q.position.toFixed(1)} with low CTR (${q.ctr.toFixed(1)}%).`,
      evidence: `Search Console query: "${q.query}" targeting page "${q.page}".`,
      relatedExistingContent: q.page,
      suggestedSearchIntent: 'INFORMATIONAL',
      priority: q.impressions > 500 ? 'HIGH' : 'MEDIUM',
    });
  }

  // 3. Stale content / Update required
  const staleBlogs = await prisma.blog.findMany({
    where: { status: 'UPDATE_REQUIRED' },
    select: { id: true, title: true, slug: true },
    take: 10,
  });

  for (const sb of staleBlogs) {
    opportunities.push({
      topic: `Refresh: ${sb.title}`,
      opportunityType: 'UPDATE_ARTICLE',
      reason: `Article is flagged UPDATE_REQUIRED due to aging content (> 30 days) or price dependencies.`,
      evidence: `Blog slug: /blog/${sb.slug}`,
      relatedExistingContent: `/blog/${sb.slug}`,
      suggestedSearchIntent: 'INFORMATIONAL',
      priority: 'MEDIUM',
    });
  }

  return opportunities;
}

/**
 * Detects orphan pages and keyword cannibalization across existing blogs.
 */
export async function analyzeContentClusters() {
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, content: true, createdAt: true, category: { select: { name: true } } },
  });

  const orphanPages: any[] = [];
  const cannibalizationRisks: any[] = [];
  const linkSuggestions: any[] = [];

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    const incomingLinks = blogs.filter(b => b.id !== blog.id && b.content && b.content.includes(`/blog/${blog.slug}`));

    if (incomingLinks.length === 0) {
      orphanPages.push({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category?.name || 'General',
        publishedDate: blog.createdAt,
        incomingLinksCount: 0,
        suggestedLinkingPages: blogs.filter(b => b.id !== blog.id && b.category?.name === blog.category?.name).slice(0, 3).map(b => ({
          title: b.title,
          slug: b.slug,
        })),
      });
    }

    // Check potential cannibalization with other blogs
    for (let j = i + 1; j < blogs.length; j++) {
      const other = blogs[j];
      const similarity = calculateWordOverlap(blog.title, other.title);
      if (similarity > 0.45) {
        cannibalizationRisks.push({
          pageA: { id: blog.id, title: blog.title, url: `/blog/${blog.slug}` },
          pageB: { id: other.id, title: other.title, url: `/blog/${other.slug}` },
          similarityScore: Math.round(similarity * 100),
          reason: `High title word overlap (${Math.round(similarity * 100)}%) indicating potentially conflicting search intent.`,
          suggestedAction: similarity > 0.75 ? 'MERGE_OR_REDIRECT' : 'DIFFERENTIATE_HEADINGS',
        });
      }
    }
  }

  return {
    orphanPages,
    cannibalizationRisks,
    linkSuggestions,
  };
}

function calculateWordOverlap(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  for (const w of words1) {
    if (words2.has(w)) common++;
  }

  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? common / union : 0;
}
