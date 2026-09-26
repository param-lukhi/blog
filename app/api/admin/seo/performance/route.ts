import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // 1. Query Opportunity Detector:
  // Identify queries where impressions >= 50, position between 4 and 20, and CTR < 4%
  const records = await prisma.searchPerformance.findMany({
    where: {
      impressions: { gte: 10 },
    },
    orderBy: { impressions: 'desc' },
    take: 100,
  });

  const queryOpportunities = records
    .filter(r => r.position >= 4 && r.position <= 25 && (r.impressions > 50 ? r.ctr < 5 : true))
    .map(r => {
      let suggestedAction = 'Improve title and meta description with higher intent keyword placement';
      if (r.position > 10) {
        suggestedAction = 'Expand content depth, add FAQ schema and comprehensive comparison table';
      } else if (r.ctr < 2) {
        suggestedAction = 'Refine title tag to be more engaging and add clear year / benefit modifier';
      }

      return {
        query: r.query,
        page: r.page,
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.ctr,
        position: r.position,
        classification: 'POTENTIAL OPPORTUNITY',
        suggestedAction,
      };
    });

  // 2. Page Performance Analysis:
  // For published blogs and products, aggregate views/clicks and search metrics
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, updatedAt: true, views: true },
    take: 50,
  });

  const analyticsClicks = await prisma.analytics.groupBy({
    by: ['path'],
    where: { eventType: { in: ['AFFILIATE_CLICK', 'affiliate_click'] } },
    _count: { id: true },
  });

  const clickMap = new Map(analyticsClicks.filter(a => a.path).map(a => [a.path!, a._count.id]));

  const pagePerformances = blogs.map(b => {
    const pageUrl = `/blog/${b.slug}`;
    const pageGsc = records.find(r => r.page.includes(b.slug));
    const affiliateClicks = clickMap.get(pageUrl) || 0;

    return {
      title: b.title,
      url: pageUrl,
      clicks: pageGsc?.clicks || 0,
      impressions: pageGsc?.impressions || 0,
      ctr: pageGsc?.ctr || 0,
      position: pageGsc?.position || 0,
      affiliateClicks,
      conversions: 0,
      revenue: 0,
      lastUpdated: b.updatedAt,
    };
  });

  return NextResponse.json({
    queryOpportunities,
    pagePerformances,
  });
}
