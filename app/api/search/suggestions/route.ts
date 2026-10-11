import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], blogs: [], categories: [] });
    }

    const [products, blogs, categories] = await Promise.all([
      db.product.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          images: true,
        },
        take: 5,
      }),
      db.blog.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { metaDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
        },
        take: 5,
      }),
      db.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          OR: [
            { products: { some: { status: 'PUBLISHED' } } },
            { blogs: { some: { status: 'PUBLISHED' } } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 3,
      }),
    ]);

    return NextResponse.json({ products, blogs, categories });
  } catch (error) {
    console.error('Search suggestion error:', error);
    return NextResponse.json({ products: [], blogs: [], categories: [] });
  }
}
