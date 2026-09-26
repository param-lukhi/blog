import { db } from "@/lib/db";

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateType?: 'SLUG' | 'PRODUCT' | 'TITLE';
  matchedBlog?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  warningMessage?: string;
}

/**
 * Check if a blog draft has potential duplicate collisions with published or draft articles
 */
export async function checkDuplicateContent(params: {
  currentBlogId?: string;
  slug: string;
  title: string;
  productId?: string | null;
}): Promise<DuplicateCheckResult> {
  const { currentBlogId, slug, title, productId } = params;

  try {
    const cleanSlug = slug.trim().toLowerCase();
    const cleanTitle = title.trim().toLowerCase();

    // 1. Slug Collision Check
    const slugMatch = await db.blog.findFirst({
      where: {
        slug: cleanSlug,
        id: currentBlogId ? { not: currentBlogId } : undefined,
      },
      select: { id: true, title: true, slug: true, status: true },
    });

    if (slugMatch) {
      return {
        hasDuplicate: true,
        duplicateType: 'SLUG',
        matchedBlog: slugMatch,
        warningMessage: `An article with the exact slug "/${cleanSlug}" already exists: "${slugMatch.title}".`,
      };
    }

    // 2. Product ID Collision Check (if binding to same product)
    if (productId) {
      const productMatch = await db.blog.findFirst({
        where: {
          productId,
          id: currentBlogId ? { not: currentBlogId } : undefined,
        },
        select: { id: true, title: true, slug: true, status: true },
      });

      if (productMatch) {
        return {
          hasDuplicate: true,
          duplicateType: 'PRODUCT',
          matchedBlog: productMatch,
          warningMessage: `A review article for this specific product already exists: "${productMatch.title}".`,
        };
      }
    }

    // 3. Title Keyword / Similarity Check
    const words = cleanTitle.split(/\s+/).filter((w) => w.length > 3);
    if (words.length >= 2) {
      const titleMatches = await db.blog.findMany({
        where: {
          id: currentBlogId ? { not: currentBlogId } : undefined,
          OR: words.slice(0, 3).map((w) => ({ title: { contains: w, mode: 'insensitive' } })),
        },
        select: { id: true, title: true, slug: true, status: true },
        take: 3,
      });

      for (const candidate of titleMatches) {
        const candidateWords = candidate.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const overlap = words.filter((w) => candidateWords.includes(w)).length;
        const similarity = overlap / Math.max(words.length, candidateWords.length);

        if (similarity > 0.75) {
          return {
            hasDuplicate: true,
            duplicateType: 'TITLE',
            matchedBlog: candidate,
            warningMessage: `High title similarity (${Math.round(similarity * 100)}%) detected with existing article: "${candidate.title}".`,
          };
        }
      }
    }

    return { hasDuplicate: false };
  } catch (err) {
    console.error('[DuplicateCheck] Error checking duplicates:', err);
    return { hasDuplicate: false };
  }
}
