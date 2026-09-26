import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { auditAmazonTag } from '@/lib/publishingWorkflow';
import { storeAdapters } from '@/lib/stores/adapters';
import { auditAdSenseReadiness } from '@/lib/adsenseAuditor';
import { getEmailProviderStatus } from '@/lib/email/provider';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const amazonAudit = auditAmazonTag();
    const flipkartStatus = storeAdapters.flipkart.getStatus();
    const cromaStatus = storeAdapters.croma.getStatus();
    const adsenseAudit = await auditAdSenseReadiness();
    const emailStatus = getEmailProviderStatus();

    // Fetch real metrics from DB
    const [totalClicks, totalConversions, confirmedConversions] = await Promise.all([
      prisma.analytics.count({ where: { eventType: 'AFFILIATE_CLICK' } }),
      prisma.affiliateConversion.count(),
      prisma.affiliateConversion.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { commission: true, amount: true },
      }),
    ]);

    const hasRealConversions = totalConversions > 0;

    return NextResponse.json({
      healthStatus: amazonAudit.status === 'VERIFIED' ? 'HEALTHY' : 'CONFIGURATION_REQUIRED',
      networks: {
        amazon: {
          name: 'Amazon Associates',
          status: amazonAudit.status === 'VERIFIED' ? 'ACTIVE' : 'REQUIRES_VERIFICATION',
          message: amazonAudit.message,
          tag: amazonAudit.tag,
          webhookSupported: false,
        },
        flipkart: {
          name: 'Flipkart Affiliate',
          status: flipkartStatus.status === 'SUPPORTED' ? 'ACTIVE' : 'NOT_CONFIGURED',
          message: flipkartStatus.reason || 'Adapter supported',
          webhookSupported: true,
        },
        croma: {
          name: 'Croma Affiliate',
          status: cromaStatus.status === 'SUPPORTED' ? 'ACTIVE' : 'NOT_CONFIGURED',
          message: cromaStatus.reason || 'Adapter supported',
          webhookSupported: true,
        },
      },
      monetizationReadiness: {
        adsenseStatus: adsenseAudit.readyForReview ? 'READY FOR REVIEW' : 'NEEDS ATTENTION',
        adsenseScore: adsenseAudit.score,
        adsTxtConfigured: Boolean(process.env.ADSENSE_PUBLISHER_ID),
        emailProviderConfigured: emailStatus.configured,
      },
      actualMetrics: {
        totalTrackedClicks: totalClicks,
        totalTrackedConversions: totalConversions,
        confirmedRevenue: confirmedConversions._sum.commission || 0,
        confirmedSalesVolume: confirmedConversions._sum.amount || 0,
        conversionDataStatus: hasRealConversions ? 'MEASURED' : 'DATA NOT AVAILABLE',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch monetization health' },
      { status: 500 }
    );
  }
}
