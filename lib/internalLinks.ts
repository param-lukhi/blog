import { db } from "@/lib/db";

export interface RelatedContentResults {
  relatedBlogs: Array<{ id: string; title: string; slug: string; featuredImage: string; categoryName: string }>;
  relatedProducts: Array<{ id: string; name: string; slug: string; brand: string; price: string }>;
  relatedComparisons: Array<{ id: string; title: string; slug: string }>;
  categorySlug?: string;
  categoryName?: string;
}

/**
 * Fetch intelligent related content based on real relationships (category, brand, tags)
 */
export async function getRelatedContent(options: {
  currentBlogId?: string;
  categoryId?: string;
  brand?: string;
  tags?: string[];
  limit?: number;
}): Promise<RelatedContentResults> {
  const { currentBlogId, categoryId, brand, tags = [], limit = 4 } = options;

  try {
    // 1. Related Published Blogs (same category or shared tags)
    const blogWhere: any = {
      status: 'PUBLISHED',
    };
    if (currentBlogId) {
      blogWhere.id = { not: currentBlogId };
    }
    if (categoryId) {
      blogWhere.categoryId = categoryId;
    }

    const blogs = await db.blog.findMany({
      where: blogWhere,
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        category: { select: { name: true, slug: true } },
      },
      take: limit,
      orderBy: { views: 'desc' },
    });

    const relatedBlogs = blogs.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      featuredImage: b.featuredImage,
      categoryName: b.category?.name || 'Review',
    }));

    // 2. Related Products
    const productWhere: any = {
      status: 'PUBLISHED',
    };
    if (categoryId) {
      productWhere.categoryId = categoryId;
    }
    if (brand) {
      productWhere.brand = { contains: brand, mode: 'insensitive' };
    }

    const products = await db.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        price: true,
      },
      take: limit,
      orderBy: { isFeatured: 'desc' },
    });

    // 3. Related Comparisons
    const comparisons = await db.comparison.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    const relatedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
    }));

    return {
      relatedBlogs,
      relatedProducts,
      relatedComparisons: comparisons,
      categoryName: blogs[0]?.category?.name,
      categorySlug: blogs[0]?.category?.slug,
    };
  } catch (err) {
    console.error('[InternalLinks] Error fetching related content:', err);
    return {
      relatedBlogs: [],
      relatedProducts: [],
      relatedComparisons: [],
    };
  }
}
