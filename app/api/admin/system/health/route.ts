import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { getEmailProviderStatus } from '@/lib/email/provider';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  try {
    // 1. Database Health & Latency Test
    const dbStart = Date.now();
    let dbStatus: 'HEALTHY' | 'WARNING' | 'FAILED' = 'HEALTHY';
    let dbLatencyMs = 0;
    let dbError: string | null = null;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
      if (dbLatencyMs > 1500) {
        dbStatus = 'WARNING';
      }
    } catch (e: any) {
      dbStatus = 'FAILED';
      dbError = 'Database unreachable or query timed out.';
    }

    // 2. Email Provider Status
    const emailInfo = getEmailProviderStatus();
    const emailStatus = emailInfo.configured ? 'HEALTHY' : 'NOT CONFIGURED';

    // 3. Storage Status
    const storageConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;
    const storageStatus = storageConfigured ? 'HEALTHY' : 'WARNING (Local fallback active)';

    // 4. Cron & Automated Schedule Status
    const cronSecretConfigured = !!(process.env.CRON_SECRET || process.env.ADMIN_SESSION_SECRET);
    const cronStatus = cronSecretConfigured ? 'HEALTHY' : 'NOT CONFIGURED';

    // 5. Search Console Integration Status
    const gscConfigured = !!(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
    const gscStatus = gscConfigured ? 'HEALTHY' : 'NOT CONFIGURED';

    // 6. Affiliate Integrations Status
    const affiliateWebhooksConfigured = !!(process.env.AFFILIATE_WEBHOOK_SECRET || process.env.ADMIN_SESSION_SECRET);
    const affiliateWebhookStatus = affiliateWebhooksConfigured ? 'HEALTHY' : 'NOT CONFIGURED';

    // 7. Recent Errors count
    const [recentErrorCount, recentFailedJobsCount, openSeoIssuesCount, tableCounts] = await Promise.all([
      prisma.systemErrorLog.count({ where: { status: 'OPEN', severity: { in: ['ERROR', 'CRITICAL'] } } }),
      prisma.jobLog.count({ where: { status: 'FAILED' } }),
      prisma.seoIssue.count({ where: { status: 'OPEN' } }),
      Promise.all([
        prisma.product.count(),
        prisma.blog.count(),
        prisma.productPrice.count(),
        prisma.priceHistory.count(),
        prisma.affiliateConversion.count(),
        prisma.newsletterSubscriber.count(),
        prisma.priceAlert.count(),
        prisma.productReview.count(),
      ]).then(([products, blogs, prices, history, conversions, subscribers, priceAlerts, reviews]) => ({
        products,
        blogs,
        prices,
        history,
        conversions,
        subscribers,
        priceAlerts,
        reviews,
      })),
    ]);

    // Compute Overall System Health
    let overallHealth: 'HEALTHY' | 'WARNING' | 'FAILED' = 'HEALTHY';
    if (dbStatus === 'FAILED') {
      overallHealth = 'FAILED';
    } else if (recentErrorCount > 5 || dbStatus === 'WARNING' || recentFailedJobsCount > 3) {
      overallHealth = 'WARNING';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overallHealth,
      services: {
        application: {
          name: 'BlogWeb904 Production Core',
          status: 'HEALTHY',
          framework: 'Next.js 14 App Router (Vercel Serverless)',
          nodeVersion: process.version,
          uptimeSec: Math.floor(process.uptime()),
          environment: process.env.NODE_ENV || 'production',
        },
        database: {
          name: 'Neon PostgreSQL (Serverless)',
          status: dbStatus,
          latencyMs: dbLatencyMs,
          error: dbError,
          provider: 'PostgreSQL / Prisma ORM',
          backupStatus: 'PROVIDER-MANAGED (Continuous Point-in-Time Recovery enabled on Neon)',
          tables: tableCounts,
        },
        cron: {
          name: 'Vercel Cron & Scheduled Publishing',
          status: cronStatus,
          lastFailedJobs: recentFailedJobsCount,
        },
        email: {
          name: 'Email Delivery Engine',
          status: emailStatus,
          provider: emailInfo.provider,
          description: emailInfo.statusText,
        },
        storage: {
          name: 'Media & File Storage',
          status: storageStatus,
          backend: storageConfigured ? 'Vercel Blob Storage' : 'Local Static Disk Uploads',
        },
        searchConsole: {
          name: 'Google Search Console API',
          status: gscStatus,
          note: gscConfigured ? 'Connected' : 'Credentials not configured. Rule-based technical SEO active.',
        },
        affiliateWebhooks: {
          name: 'Affiliate Conversion Postback Webhook',
          status: affiliateWebhookStatus,
          endpoint: '/api/affiliate/webhook',
        },
      },
      metrics: {
        recentErrorCount,
        recentFailedJobsCount,
        openSeoIssuesCount,
      },
    });
  } catch (error: any) {
    console.error('[Health API Error]', error);
    return NextResponse.json(
      {
        success: false,
        overallHealth: 'FAILED',
        error: 'Critical error reading system health metrics',
      },
      { status: 500 }
    );
  }
}
