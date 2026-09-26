/**
 * SEO Health Engine & Search Console Integration for BlogWeb904 (Phase 4)
 * Provides technical audits across published articles, products, categories, and sitemaps.
 * 
 * Rules:
 * 1. Strictly internal technical audits (NOT fake Google ranking metrics).
 * 2. If Google Search Console API keys are missing, report status as NOT_CONFIGURED.
 * 3. Never invent clicks, impressions, or CTR when unconfigured.
 */

export interface SEOIssue {
  id: string;
  type: 'BLOG' | 'PRODUCT' | 'CATEGORY' | 'GLOBAL';
  title: string;
  slug: string;
  severity: 'CRITICAL' | 'NEEDS_ATTENTION' | 'HEALTHY';
  rule: string;
  description: string;
  recommendation: string;
}

export interface SEOAuditSummary {
  healthyCount: number;
  needsAttentionCount: number;
  criticalCount: number;
  totalItemsChecked: number;
  overallScore: number;
  issues: SEOIssue[];
  searchConsoleStatus: {
    status: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
    reason?: string;
    siteUrl?: string;
    lastChecked?: string;
  };
}

/**
 * Check Google Search Console Configuration
 */
export function getSearchConsoleStatus() {
  const email = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';

  if (!email || !key) {
    return {
      status: 'NOT_CONFIGURED' as const,
      reason: 'Google Search Console API service account credentials missing in environment (GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL / GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY)',
      siteUrl,
      lastChecked: new Date().toISOString(),
    };
  }

  return {
    status: 'CONNECTED' as const,
    siteUrl,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Perform technical SEO audit on blog articles, products, and categories
 */
export function auditContentSEO(
  blogs: Array<{
    id: string;
    title: string;
    slug: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    content: string;
    featuredImage?: string | null;
    affiliateUrl?: string | null;
    status: string;
  }>,
  products: Array<{
    id: string;
    name: string;
    slug: string;
    images?: string | null;
    specifications?: string | null;
    status: string;
  }>,
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  }>
): SEOAuditSummary {
  const issues: SEOIssue[] = [];

  let healthyCount = 0;
  let needsAttentionCount = 0;
  let criticalCount = 0;

  // 1. Audit Blogs
  for (const blog of blogs) {
    let blogHasIssue = false;

    // Rule: Missing Meta Title
    if (!blog.metaTitle && (!blog.title || blog.title.length < 10)) {
      issues.push({
        id: `blog_title_${blog.id}`,
        type: 'BLOG',
        title: blog.title,
        slug: blog.slug,
        severity: 'CRITICAL',
        rule: 'Missing SEO Title',
        description: 'Article lacks an optimized meta title or title is under 10 characters.',
        recommendation: 'Add a 50-60 character meta title targeting commercial search intent.',
      });
      blogHasIssue = true;
    }

    // Rule: Missing Meta Description
    if (!blog.metaDescription || blog.metaDescription.trim().length < 40) {
      issues.push({
        id: `blog_desc_${blog.id}`,
        type: 'BLOG',
        title: blog.title,
        slug: blog.slug,
        severity: 'NEEDS_ATTENTION',
        rule: 'Short/Missing Meta Description',
        description: 'Meta description is missing or too short for rich search engine snippets.',
        recommendation: 'Add a compelling 140-160 character description including primary product keywords.',
      });
      blogHasIssue = true;
    }

    // Rule: Thin Content (< 600 words)
    const wordCount = blog.content ? blog.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length : 0;
    if (wordCount < 600 && blog.status === 'PUBLISHED') {
      issues.push({
        id: `blog_thin_${blog.id}`,
        type: 'BLOG',
        title: blog.title,
        slug: blog.slug,
        severity: 'NEEDS_ATTENTION',
        rule: 'Thin Content',
        description: `Article has only ${wordCount} words. In-depth affiliate reviews perform best at 1,500+ words.`,
        recommendation: 'Expand product comparison, specs breakdown, and testing methodology.',
      });
      blogHasIssue = true;
    }

    // Rule: Missing H1 Heading in Content
    if (blog.content && !blog.content.includes('<h1') && !blog.content.includes('# ')) {
      issues.push({
        id: `blog_h1_${blog.id}`,
        type: 'BLOG',
        title: blog.title,
        slug: blog.slug,
        severity: 'NEEDS_ATTENTION',
        rule: 'Missing Primary H1 Tag',
        description: 'Article body does not contain an explicit H1 heading hierarchy.',
        recommendation: 'Ensure single primary H1 heading is rendered at top of post template.',
      });
      blogHasIssue = true;
    }

    // Rule: Missing Featured Image / ALT text
    if (!blog.featuredImage) {
      issues.push({
        id: `blog_img_${blog.id}`,
        type: 'BLOG',
        title: blog.title,
        slug: blog.slug,
        severity: 'CRITICAL',
        rule: 'Missing Featured Image',
        description: 'Article has no OpenGraph/featured image set.',
        recommendation: 'Upload a high-resolution 1200x630 featured product image.',
      });
      blogHasIssue = true;
    }

    // Rule: Missing Affiliate Disclosure on affiliate posts
    if (blog.affiliateUrl && !blog.content.toLowerCase().includes('affiliate') && !blog.content.toLowerCase().includes('commission')) {
      issues.push({
        id: `blog_disclosure_${blog.id}`,
        type: 'BLOG',
        title: blog.title,
        slug: blog.slug,
        severity: 'NEEDS_ATTENTION',
        rule: 'Missing In-Article Affiliate Disclosure',
        description: 'Post contains affiliate links but does not have prominent FTC/Amazon affiliate disclosure in body.',
        recommendation: 'Ensure dynamic affiliate disclosure banner is enabled above the fold.',
      });
      blogHasIssue = true;
    }

    if (!blogHasIssue) {
      healthyCount++;
    }
  }

  // 2. Audit Products
  for (const prod of products) {
    if (!prod.images || prod.images === '[]' || prod.images.length < 5) {
      issues.push({
        id: `prod_img_${prod.id}`,
        type: 'PRODUCT',
        title: prod.name,
        slug: prod.slug,
        severity: 'CRITICAL',
        rule: 'Missing Product Images',
        description: 'Product listing has no primary image.',
        recommendation: 'Upload verified product image with descriptive ALT text.',
      });
    } else {
      healthyCount++;
    }
  }

  // 3. Audit Categories
  for (const cat of categories) {
    if (!cat.description || cat.description.trim().length < 20) {
      issues.push({
        id: `cat_desc_${cat.id}`,
        type: 'CATEGORY',
        title: cat.name,
        slug: cat.slug,
        severity: 'NEEDS_ATTENTION',
        rule: 'Missing Category Hub Description',
        description: 'Category hub has insufficient introductory text for category indexation.',
        recommendation: 'Add 2-3 sentences explaining this buying category.',
      });
    } else {
      healthyCount++;
    }
  }

  // Count severities
  criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
  needsAttentionCount = issues.filter((i) => i.severity === 'NEEDS_ATTENTION').length;

  const totalItems = blogs.length + products.length + categories.length;
  const rawScore = totalItems > 0 ? Math.max(0, Math.round(100 - (criticalCount * 15 + needsAttentionCount * 5))) : 100;

  return {
    healthyCount,
    needsAttentionCount,
    criticalCount,
    totalItemsChecked: totalItems,
    overallScore: Math.min(100, Math.max(0, rawScore)),
    issues,
    searchConsoleStatus: getSearchConsoleStatus(),
  };
}
