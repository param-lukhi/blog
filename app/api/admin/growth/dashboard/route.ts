import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { getSearchConsoleStatus } from '@/lib/searchConsole';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // 1. Core catalog counts
  const publishedBlogs = await prisma.blog.count({ where: { status: 'PUBLISHED' } });
  const publishedProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
  const comparisonsCount = await prisma.comparison.count();
  const subscribersCount = await prisma.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } });
  const pendingModeration = await prisma.productReview.count({ where: { status: 'PENDING' } });

  // 2. Growth metrics
  const affiliateClicks = await prisma.analytics.count({ where: { eventType: { in: ['AFFILIATE_CLICK', 'affiliate_click'] } } });
  const conversions = await prisma.affiliateConversion.findMany();
  const confirmedRevenue = conversions.filter(c => c.status === 'CONFIRMED' || c.status === 'APPROVED').reduce((s, c) => s + (c.commission || 0), 0);

  // 3. Search Console Status
  const gscStatus = getSearchConsoleStatus();
  const gscRecords = await prisma.searchPerformance.findMany({ take: 10 });
  const totalOrganicClicks = gscRecords.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = gscRecords.reduce((s, r) => s + r.impressions, 0);

  // 4. Content Opportunities
  const activeOpportunities = await prisma.contentOpportunity.count({ where: { status: { in: ['DISCOVERED', 'PLANNED'] } } });
  const activeExperiments = await prisma.growthExperiment.count({ where: { status: 'RUNNING' } });

  // 5. Growth Alerts (Actionable signals)
  const alerts: any[] = [];
  if (!gscStatus.isConfigured) {
    alerts.push({
      severity: 'INFO',
      type: 'GSC_NOT_CONFIGURED',
      message: 'Google Search Console credentials not configured in environment. Organic search sync is paused.',
    });
  }

  if (conversions.length === 0) {
    alerts.push({
      severity: 'INFO',
      type: 'NO_CONVERSIONS',
      message: 'No incoming conversion postbacks recorded yet. Revenue dashboard shows verified zero.',
    });
  }

  const staleBlogs = await prisma.blog.count({ where: { status: 'UPDATE_REQUIRED' } });
  if (staleBlogs > 0) {
    alerts.push({
      severity: 'WARNING',
      type: 'STALE_CONTENT',
      message: `${staleBlogs} published articles flagged UPDATE_REQUIRED due to aging content or price shifts.`,
    });
  }

  return NextResponse.json({
    metrics: {
      publishedBlogs,
      publishedProducts,
      comparisonsCount,
      subscribersCount,
      pendingModeration,
      affiliateClicks,
      totalConversions: conversions.length,
      confirmedRevenue,
      totalOrganicClicks,
      totalImpressions,
      activeOpportunities,
      activeExperiments,
    },
    gscStatus,
    alerts,
  });
}
