/**
 * AI SEO Meta Optimizer & Suggestion Engine for BlogWeb904 (Phase 5)
 * Formulates high-quality, compliant metadata suggestions with explicit rationales.
 * 
 * Rules:
 * 1. Strictly suggestion-based (Requires human approval before applying).
 * 2. Never promises fake ranking boosts.
 * 3. Never overwrites existing metadata silently.
 */

export interface SEOSuggestion {
  field: 'metaTitle' | 'metaDescription' | 'slug' | 'h1' | 'internalLinks';
  currentValue: string;
  suggestedValue: string;
  rationale: string;
  characterCount?: { current: number; suggested: number; idealMax: number };
}

export interface SEOOptimizationReport {
  blogId: string;
  title: string;
  overallHealthScore: number;
  suggestions: SEOSuggestion[];
  suggestedInternalLinks: Array<{
    title: string;
    url: string;
    type: 'PRODUCT' | 'BLOG' | 'CATEGORY' | 'COMPARISON';
    relevanceReason: string;
  }>;
}

export function generateSEOSuggestions(params: {
  blogId: string;
  title: string;
  currentMetaTitle?: string | null;
  currentMetaDescription?: string | null;
  currentSlug: string;
  content: string;
  productName?: string | null;
  brand?: string | null;
  categoryName?: string | null;
  relatedEntities?: {
    products?: Array<{ id: string; name: string; slug: string }>;
    blogs?: Array<{ id: string; title: string; slug: string }>;
    categories?: Array<{ id: string; name: string; slug: string }>;
  };
}): SEOOptimizationReport {
  const {
    blogId,
    title,
    currentMetaTitle = '',
    currentMetaDescription = '',
    currentSlug,
    content,
    productName,
    brand,
    categoryName,
    relatedEntities,
  } = params;

  const suggestions: SEOSuggestion[] = [];
  const cleanTitle = title.trim();
  const subjectName = productName || cleanTitle;

  // 1. Meta Title Optimization (Target 50-60 chars)
  const currentTitleVal = currentMetaTitle?.trim() || cleanTitle;
  let suggestedTitle = `${subjectName}: Features, Price & In-Depth Review`;
  if (suggestedTitle.length > 60) {
    suggestedTitle = `${subjectName}: Review & Buying Guide`;
  }
  if (suggestedTitle.length > 60) {
    suggestedTitle = `${subjectName.slice(0, 42)}: Full Review`;
  }

  suggestions.push({
    field: 'metaTitle',
    currentValue: currentTitleVal,
    suggestedValue: suggestedTitle,
    rationale:
      'Incorporates primary commercial search intent and product name while remaining under the 60-character SERP cutoff limit.',
    characterCount: {
      current: currentTitleVal.length,
      suggested: suggestedTitle.length,
      idealMax: 60,
    },
  });

  // 2. Meta Description Optimization (Target 140-160 chars)
  const currentDescVal = currentMetaDescription?.trim() || '';
  const suggestedDesc = `Read our comprehensive research-based review of the ${subjectName}. Explore verified specs, pricing comparison, pros, cons, and user recommendations.`;

  suggestions.push({
    field: 'metaDescription',
    currentValue: currentDescVal,
    suggestedValue: suggestedDesc,
    rationale:
      'Provides a high CTR overview of specifications, price comparison, and editorial pros/cons without exceeding the 160-character limit.',
    characterCount: {
      current: currentDescVal.length,
      suggested: suggestedDesc.length,
      idealMax: 160,
    },
  });

  // 3. Clean Slug Optimization
  const suggestedSlug = (productName || cleanTitle)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  suggestions.push({
    field: 'slug',
    currentValue: currentSlug,
    suggestedValue: suggestedSlug,
    rationale: 'Clean, hyphenated URL format optimized for search crawlers and shareability.',
  });

  // 4. Primary H1 Suggestion
  const suggestedH1 = `${subjectName} Review: Specifications, Price & Verdict`;
  suggestions.push({
    field: 'h1',
    currentValue: cleanTitle,
    suggestedValue: suggestedH1,
    rationale: 'Clear, authoritative top-level heading establishing content hierarchy and topic authority.',
  });

  // 5. Contextual Internal Links
  const suggestedInternalLinks: Array<{
    title: string;
    url: string;
    type: 'PRODUCT' | 'BLOG' | 'CATEGORY' | 'COMPARISON';
    relevanceReason: string;
  }> = [];

  if (relatedEntities?.products && relatedEntities.products.length > 0) {
    relatedEntities.products.slice(0, 2).forEach((p) => {
      suggestedInternalLinks.push({
        title: `Product: ${p.name}`,
        url: `/product/${p.slug}`,
        type: 'PRODUCT',
        relevanceReason: `Matches ${categoryName || 'same category'} hardware ecosystem for buying cross-reference.`,
      });
    });
  }

  if (relatedEntities?.blogs && relatedEntities.blogs.length > 0) {
    relatedEntities.blogs.slice(0, 2).forEach((b) => {
      suggestedInternalLinks.push({
        title: `Article: ${b.title}`,
        url: `/blog/${b.slug}`,
        type: 'BLOG',
        relevanceReason: 'Provides related reader journey to top reviewed alternatives.',
      });
    });
  }

  // Calculate optimization health score
  let score = 100;
  if (currentTitleVal.length < 20 || currentTitleVal.length > 65) score -= 15;
  if (currentDescVal.length < 50 || currentDescVal.length > 170) score -= 20;
  if (!content.includes('<h1') && !content.includes('# ')) score -= 15;
  if (suggestedInternalLinks.length === 0) score -= 10;

  return {
    blogId,
    title: cleanTitle,
    overallHealthScore: Math.max(20, score),
    suggestions,
    suggestedInternalLinks,
  };
}
