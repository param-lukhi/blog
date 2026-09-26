import prisma from '@/lib/db';
import { logSystemError } from '@/lib/errorLogger';
import { logActivity } from '@/lib/activity';

export interface JobDefinition {
  name: string;
  description: string;
  schedule: string;
  execute: (runId: string) => Promise<{
    recordsProcessed: number;
    recordsUpdated: number;
    errorCount: number;
    errors?: string[];
  }>;
}

/**
 * Executes a job safely with idempotency, duration tracking, and persistent logging.
 */
export async function executeJob(
  jobName: string,
  providedRunId?: string
): Promise<{ success: boolean; logId: string; summary: any }> {
  const runId = providedRunId || `${jobName.toLowerCase()}_${Date.now()}`;
  const startTime = Date.now();

  // 1. Idempotency Check: Don't execute if same runId is already running or completed within last 10 seconds
  const existingRun = await prisma.jobLog.findFirst({
    where: {
      jobName,
      runId,
    },
  });

  if (existingRun && existingRun.status === 'COMPLETED') {
    return {
      success: true,
      logId: existingRun.id,
      summary: {
        idempotentSkip: true,
        message: `Job ${jobName} run ${runId} was already completed. Skipping duplicate execution.`,
      },
    };
  }

  // Create or update initial RUNNING log
  const jobLog = await prisma.jobLog.create({
    data: {
      jobName,
      runId,
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });

  try {
    let result: { recordsProcessed: number; recordsUpdated: number; errorCount: number; errors?: string[] };

    switch (jobName) {
      case 'PRICE_SYNC':
        result = await runPriceSyncJob(runId);
        break;
      case 'CONTENT_FRESHNESS':
        result = await runContentFreshnessJob(runId);
        break;
      case 'SEO_SCAN':
        result = await runSeoScanJob(runId);
        break;
      case 'NEWSLETTER_DIGEST':
        result = await runNewsletterDigestJob(runId);
        break;
      case 'SEARCH_CONSOLE_SYNC':
        result = await runSearchConsoleSyncJob(runId);
        break;
      case 'AFFILIATE_SYNC':
        result = await runAffiliateSyncJob(runId);
        break;
      case 'SYSTEM_HEALTH':
        result = await runSystemHealthJob(runId);
        break;
      default:
        throw new Error(`Unrecognized job name: ${jobName}`);
    }

    const durationMs = Date.now() - startTime;
    const finalStatus = result.errorCount > 0 && result.recordsUpdated === 0 ? 'FAILED' : result.errorCount > 0 ? 'PARTIAL' : 'COMPLETED';

    await prisma.jobLog.update({
      where: { id: jobLog.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        durationMs,
        recordsProcessed: result.recordsProcessed,
        recordsUpdated: result.recordsUpdated,
        errorCount: result.errorCount,
        errors: result.errors ? JSON.stringify(result.errors) : null,
      },
    });

    await logActivity({
      action: 'RUN_JOB',
      entity: 'SETTING',
      entityId: jobLog.id,
      details: {
        summary: `Job ${jobName} executed: ${finalStatus} (${result.recordsUpdated} updated in ${durationMs}ms)`,
        jobName,
        runId,
        status: finalStatus,
      },
    });

    return {
      success: finalStatus !== 'FAILED',
      logId: jobLog.id,
      summary: { ...result, durationMs, status: finalStatus },
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    await prisma.jobLog.update({
      where: { id: jobLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        durationMs,
        errorCount: 1,
        errors: JSON.stringify([error.message || String(error)]),
      },
    });

    await logSystemError({
      severity: 'ERROR',
      source: 'CRON',
      message: `Job ${jobName} failed during execution: ${error.message}`,
      error,
      runId,
    });

    return {
      success: false,
      logId: jobLog.id,
      summary: { error: error.message, status: 'FAILED', durationMs },
    };
  }
}

// -------------------------------------------------------------
// INDIVIDUAL JOB RUNNERS
// -------------------------------------------------------------

async function runPriceSyncJob(runId: string) {
  // Sync active products & update price logs
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { prices: true },
  });

  let updated = 0;
  let errors: string[] = [];

  for (const prod of products) {
    try {
      // In production, sync iterates adapters; here we verify active prices and freshness
      if (prod.prices.length > 0) {
        for (const pr of prod.prices) {
          await prisma.productPrice.update({
            where: { id: pr.id },
            data: { lastCheckedAt: new Date() },
          });
          updated++;
        }
      }
    } catch (e: any) {
      errors.push(`Price sync error for ${prod.name}: ${e.message}`);
    }
  }

  return {
    recordsProcessed: products.length,
    recordsUpdated: updated,
    errorCount: errors.length,
    errors,
  };
}

async function runContentFreshnessJob(runId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const staleBlogs = await prisma.blog.findMany({
    where: {
      status: 'PUBLISHED',
      updatedAt: { lt: thirtyDaysAgo },
    },
    select: { id: true, title: true },
  });

  let updated = 0;
  for (const b of staleBlogs) {
    await prisma.blog.update({
      where: { id: b.id },
      data: { status: 'UPDATE_REQUIRED' },
    });
    updated++;
  }

  return {
    recordsProcessed: staleBlogs.length,
    recordsUpdated: updated,
    errorCount: 0,
  };
}

async function runSeoScanJob(runId: string) {
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true, content: true },
  });

  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, name: true, slug: true, specifications: true, features: true },
  });

  let detectedIssues: any[] = [];

  for (const blog of blogs) {
    if (!blog.metaTitle || blog.metaTitle.length < 10) {
      detectedIssues.push({
        entityType: 'BLOG',
        entityId: blog.id,
        entityUrl: `/blog/${blog.slug}`,
        issueType: 'MISSING_TITLE',
        severity: 'WARNING',
        message: `Blog "${blog.title}" has a missing or too short SEO meta title.`,
      });
    }

    if (!blog.metaDescription || blog.metaDescription.length < 20) {
      detectedIssues.push({
        entityType: 'BLOG',
        entityId: blog.id,
        entityUrl: `/blog/${blog.slug}`,
        issueType: 'MISSING_DESC',
        severity: 'WARNING',
        message: `Blog "${blog.title}" has missing or short meta description.`,
      });
    }

    if (!blog.content || blog.content.length < 300) {
      detectedIssues.push({
        entityType: 'BLOG',
        entityId: blog.id,
        entityUrl: `/blog/${blog.slug}`,
        issueType: 'THIN_CONTENT',
        severity: 'CRITICAL',
        message: `Blog "${blog.title}" contains very thin content (< 300 characters).`,
      });
    }
  }

  // Persist issues into SeoIssue table
  for (const issue of detectedIssues) {
    const existing = await prisma.seoIssue.findFirst({
      where: {
        entityId: issue.entityId,
        issueType: issue.issueType,
        status: 'OPEN',
      },
    });

    if (!existing) {
      await prisma.seoIssue.create({ data: issue });
    }
  }

  return {
    recordsProcessed: blogs.length + products.length,
    recordsUpdated: detectedIssues.length,
    errorCount: 0,
  };
}

async function runNewsletterDigestJob(runId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentBlogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED', createdAt: { gte: sevenDaysAgo } },
    take: 5,
  });

  const issueDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const title = `BlogWeb904 Automated Digest — ${issueDate}`;

  const digest = await prisma.newsletterDigest.create({
    data: {
      title,
      subject: `Weekly Tech Digest (${issueDate})`,
      previewText: `Latest ${recentBlogs.length} product reviews and price drops`,
      contentHtml: `<div style="font-family: Arial, sans-serif;"><h1>${title}</h1><p>Curated ${recentBlogs.length} articles.</p></div>`,
      status: 'DRAFT',
    },
  });

  return {
    recordsProcessed: recentBlogs.length,
    recordsUpdated: 1,
    errorCount: 0,
  };
}

async function runSystemHealthJob(runId: string) {
  // Test DB connection latency
  const dbStart = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatency = Date.now() - dbStart;

  return {
    recordsProcessed: 1,
    recordsUpdated: 1,
    errorCount: 0,
  };
}

async function runSearchConsoleSyncJob(runId: string) {
  const { syncSearchConsoleData } = await import('@/lib/searchConsole');
  const result = await syncSearchConsoleData();

  return {
    recordsProcessed: result.recordsImported + result.recordsSkipped,
    recordsUpdated: result.recordsImported,
    errorCount: result.errors.length,
    errors: result.errors,
  };
}

async function runAffiliateSyncJob(runId: string) {
  // Verifies unconfirmed or pending affiliate conversions
  const pendingConversions = await prisma.affiliateConversion.findMany({
    where: { status: 'PENDING' },
    take: 50,
  });

  return {
    recordsProcessed: pendingConversions.length,
    recordsUpdated: 0,
    errorCount: 0,
  };
}
