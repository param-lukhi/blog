import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { safeJsonParse, slugify } from '@/lib/utils';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const isAdmin = isAuthorizedAdmin();
    const where: any = {};

    // Privacy & Security: Only authorized admins may view DRAFT, SCHEDULED, or HIDDEN articles
    if (isAdmin) {
      if (statusParam && statusParam !== 'ALL') {
        where.status = statusParam;
      }
    } else {
      where.status = 'PUBLISHED';
    }

    if (categorySlug) {
      const cat = await db.category.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { metaDescription: { contains: q, mode: 'insensitive' } },
        { tags: { contains: q, mode: 'insensitive' } },
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
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    if (!title || !content || !categoryId || !amazonUrl) {
      return NextResponse.json({ error: 'Missing required blog fields (title, content, category, amazonUrl)' }, { status: 400 });
    }

    // Verify category exists
    const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 });
    }

    // Clean and deduplicate slug
    let finalSlug = slugify(slug || title);
    const existingBlog = await db.blog.findUnique({ where: { slug: finalSlug } });
    if (existingBlog) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
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
        title: title.trim(),
        slug: finalSlug,
        metaTitle: metaTitle?.trim() || title.trim(),
        metaDescription: metaDescription?.trim() || '',
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
        content,
        specifications: sanitizeJson(specifications, {}),
        features: sanitizeJson(features, []),
        pros: sanitizeJson(pros, []),
        cons: sanitizeJson(cons, []),
        faqs: sanitizeJson(faqs, []),
        conclusion: conclusion?.trim() || '',
        amazonUrl: amazonUrl.trim(),
        affiliateUrl: (affiliateUrl || amazonUrl).trim(),
        categoryId,
        productId: productId || null,
        tags: sanitizeJson(tags, []),
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      },
    });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error('Create blog error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create blog' }, { status: 500 });
  }
}
