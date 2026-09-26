import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { getSearchConsoleStatus } from '@/lib/searchConsole';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const gscStatus = getSearchConsoleStatus();

    // Query native DB measured events
    const [
      blogsCount,
      productsCount,
      comparisonsCount,
      affiliateClicksCount,
      newsletterSubscribersCount,
      reviewsCount,
      priceAlertsCount,
      conversionsCount,
      confirmedRevenueAgg,
    ] = await Promise.all([
      prisma.blog.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.comparison.count(),
      prisma.analytics.count({ where: { eventType: 'AFFILIATE_CLICK' } }),
      prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.productReview.count({ where: { status: 'APPROVED' } }),
      prisma.priceAlert.count({ where: { status: 'ACTIVE' } }),
      prisma.affiliateConversion.count(),
      prisma.affiliateConversion.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { commission: true },
      }),
    ]);

    const hasRealConversions = conversionsCount > 0;
    const hasGsc = gscStatus.isConfigured;

    return NextResponse.json({
      measured: {
        publishedArticles: blogsCount,
        publishedProducts: productsCount,
        activeComparisons: comparisonsCount,
        affiliateClicks: affiliateClicksCount,
        newsletterSubscribers: newsletterSubscribersCount,
        approvedReviews: reviewsCount,
        activePriceAlerts: priceAlertsCount,
        verifiedConversions: conversionsCount,
        confirmedRevenue: confirmedRevenueAgg._sum.commission || 0,
      },
      externalIntegrations: {
        googleSearchConsole: {
          status: hasGsc ? 'CONFIGURED' : 'NOT CONFIGURED',
          message: gscStatus.message,
          organicClicks: hasGsc ? 'MEASURED' : 'DATA NOT AVAILABLE',
          impressions: hasGsc ? 'MEASURED' : 'DATA NOT AVAILABLE',
          averageCtr: hasGsc ? 'MEASURED' : 'DATA NOT AVAILABLE',
          averagePosition: hasGsc ? 'MEASURED' : 'DATA NOT AVAILABLE',
        },
        affiliatePostbacks: {
          status: hasRealConversions ? 'ACTIVE_CONVERSIONS' : 'NO VERIFIED CONVERSION DATA',
          message: hasRealConversions
            ? `${conversionsCount} verified conversions tracked via postback webhooks.`
            : 'No external conversion webhooks have posted verified transaction data yet.',
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch analytics dashboard data' },
      { status: 500 }
    );
  }
}
