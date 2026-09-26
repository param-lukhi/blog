import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const priceMin = parseFloat(searchParams.get('minPrice') || '0');
    const priceMax = parseFloat(searchParams.get('maxPrice') || '9999999');
    const store = searchParams.get('store') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // 1. Build Product filters
    const productWhere: any = { status: 'PUBLISHED' };

    if (query) {
      productWhere.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { specifications: { contains: query, mode: 'insensitive' } },
        { features: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      productWhere.category = { slug: category };
    }

    if (brand && brand !== 'ALL') {
      productWhere.brand = { equals: brand, mode: 'insensitive' };
    }

    // 2. Fetch Products + Multi-Store Prices
    const [products, totalProducts, allCategories, allBrands, allStores] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        include: {
          category: { select: { name: true, slug: true } },
          prices: {
            select: {
              storeName: true,
              storeSlug: true,
              price: true,
              inStock: true,
              affiliateUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: productWhere }),
      prisma.category.findMany({ select: { name: true, slug: true } }),
      prisma.brand.findMany({ select: { name: true, slug: true } }),
      prisma.store.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
    ]);

    // 3. Search Blogs & Comparisons if query provided
    let blogs: any[] = [];
    let comparisons: any[] = [];

    if (query) {
      [blogs, comparisons] = await Promise.all([
        prisma.blog.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { tags: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            metaDescription: true,
            featuredImage: true,
            createdAt: true,
          },
          take: 6,
        }),
        prisma.comparison.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { summary: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 4,
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      query,
      products,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
      blogs,
      comparisons,
      facets: {
        categories: allCategories,
        brands: allBrands,
        stores: allStores,
      },
    });
  } catch (error: any) {
    console.error('[Search API Error]', error);
    return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
  }
}
