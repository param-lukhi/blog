import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { safeJsonParse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const where: any = {};
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    } else if (!statusParam) {
      where.status = 'PUBLISHED';
    }

    if (categorySlug) {
      const cat = await db.category.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { metaDescription: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const blogs = await db.blog.findMany({
      where,
      include: { category: true, product: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      metaTitle,
      metaDescription,
      featuredImage,
      content,
      specifications,
      features,
      pros,
      cons,
      faqs,
      conclusion,
      amazonUrl,
      affiliateUrl,
      categoryId,
      productId,
      tags,
      status,
    } = body;

    if (!title || !slug || !content || !categoryId || !amazonUrl) {
      return NextResponse.json({ error: 'Missing required blog fields' }, { status: 400 });
    }

    const sanitizeJson = (val: any, fallback: any) => {
      if (val === undefined || val === null) return JSON.stringify(fallback);
      if (typeof val === 'string') {
        const parsed = safeJsonParse(val, null);
        if (parsed !== null && typeof parsed === 'object') {
          return JSON.stringify(parsed);
        }
        return val;
      }
      return JSON.stringify(val);
    };

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || '',
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
        content,
        specifications: sanitizeJson(specifications, {}),
        features: sanitizeJson(features, []),
        pros: sanitizeJson(pros, []),
        cons: sanitizeJson(cons, []),
        faqs: sanitizeJson(faqs, []),
        conclusion: conclusion || '',
        amazonUrl,
        affiliateUrl: affiliateUrl || amazonUrl,
        categoryId,
        productId: productId || null,
        tags: sanitizeJson(tags, []),
        status: status || 'PUBLISHED',
      },
    });

    revalidatePath('/');
    revalidatePath('/blog');

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
