import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const categories = await prisma.category.findMany({
    include: {
      products: {
        select: { id: true, name: true, slug: true, brand: true, price: true },
      },
      blogs: {
        select: { id: true, title: true, slug: true, status: true, views: true, createdAt: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const comparisons = await prisma.comparison.findMany({
    select: { id: true, title: true, slug: true },
  });

  const topicalMap = categories.map(cat => {
    // Identify pillar guide (article with 'guide' or 'ultimate' in title or most viewed)
    const pillar = cat.blogs.find(b => b.title.toLowerCase().includes('guide') || b.title.toLowerCase().includes('best')) || cat.blogs[0] || null;
    const supportingArticles = cat.blogs.filter(b => !pillar || b.id !== pillar.id);
    const categoryComparisons = comparisons.filter(c => c.title.toLowerCase().includes(cat.name.toLowerCase()));

    const missingPillar = !pillar;
    const missingComparisons = cat.products.length >= 2 && categoryComparisons.length === 0;
    const missingFaq = !cat.description || cat.description.length < 50;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      pillar: pillar ? { id: pillar.id, title: pillar.title, slug: pillar.slug } : null,
      supportingArticles: supportingArticles.map(a => ({ id: a.id, title: a.title, slug: a.slug })),
      products: cat.products,
      comparisons: categoryComparisons,
      coverageGaps: {
        missingPillar,
        missingComparisons,
        missingFaq,
      },
      clusterHealth: (!missingPillar && !missingComparisons) ? 'STRONG' : (!missingPillar || cat.products.length > 0) ? 'MODERATE' : 'WEAK',
    };
  });

  return NextResponse.json({ topicalMap });
}
