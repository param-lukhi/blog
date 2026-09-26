import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      pendingReviewsCount,
      openReportsCount,
      priceAlertsCount,
      updateRequiredBlogsCount,
      pendingConversionsCount,
      recentSyncLogs,
      recentActivity,
    ] = await Promise.all([
      prisma.productReview.count({ where: { status: 'PENDING' } }),
      prisma.reviewReport.count({ where: { status: 'OPEN' } }),
      prisma.priceAlert.count({ where: { status: 'ACTIVE' } }),
      prisma.blog.count({ where: { status: 'UPDATE_REQUIRED' } }),
      prisma.affiliateConversion.count({ where: { status: 'PENDING' } }),
      prisma.priceSyncLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5,
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const notifications = [
      ...(pendingReviewsCount > 0
        ? [
            {
              id: 'notif-reviews',
              type: 'REVIEW_PENDING',
              title: `${pendingReviewsCount} Pending Community Reviews`,
              message: 'Community reviews are awaiting editorial review and moderation.',
              link: '/admin/moderation',
              severity: 'warning',
            },
          ]
        : []),
      ...(openReportsCount > 0
        ? [
            {
              id: 'notif-reports',
              type: 'REPORT_OPEN',
              title: `${openReportsCount} Open Review Abuse Reports`,
              message: 'Users flagged content for spam or policy violations.',
              link: '/admin/moderation',
              severity: 'danger',
            },
          ]
        : []),
      ...(updateRequiredBlogsCount > 0
        ? [
            {
              id: 'notif-freshness',
              type: 'UPDATE_REQUIRED',
              title: `${updateRequiredBlogsCount} Articles Need Freshness Update`,
              message: 'Check prices, specifications, and availability checklist.',
              link: '/admin/content',
              severity: 'info',
            },
          ]
        : []),
      ...(pendingConversionsCount > 0
        ? [
            {
              id: 'notif-conversions',
              type: 'CONVERSION_PENDING',
              title: `${pendingConversionsCount} Pending Affiliate Conversions`,
              message: 'Merchant postback conversions awaiting final confirmation.',
              link: '/admin/affiliate',
              severity: 'success',
            },
          ]
        : []),
    ];

    return NextResponse.json({
      success: true,
      counts: {
        pendingReviews: pendingReviewsCount,
        openReports: openReportsCount,
        activePriceAlerts: priceAlertsCount,
        updateRequiredBlogs: updateRequiredBlogsCount,
        pendingConversions: pendingConversionsCount,
      },
      notifications,
      recentActivity,
      recentSyncLogs,
    });
  } catch (error: any) {
    console.error('[Admin Notifications Error]', error);
    return NextResponse.json({ error: 'Failed to fetch admin notifications' }, { status: 500 });
  }
}
