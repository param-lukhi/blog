import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { executeJob } from '@/lib/jobs/registry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [recentLogs, totalJobLogs] = await Promise.all([
      prisma.jobLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 30,
      }),
      prisma.jobLog.count(),
    ]);

    const jobDefinitions = [
      {
        name: 'PRICE_SYNC',
        description: 'Verifies multi-store prices across Amazon, Flipkart, Croma and logs history.',
        schedule: 'Every 6 Hours (Daily)',
      },
      {
        name: 'CONTENT_FRESHNESS',
        description: 'Scans published blogs for staleness (> 30 days) and marks UPDATE_REQUIRED.',
        schedule: 'Daily at 02:00 UTC',
      },
      {
        name: 'SEO_SCAN',
        description: 'Audits missing meta tags, thin content, and broken internal links.',
        schedule: 'Daily at 04:00 UTC',
      },
      {
        name: 'NEWSLETTER_DIGEST',
        description: 'Curates weekly digest draft from 7-day articles and price drops.',
        schedule: 'Weekly on Mondays at 06:00 UTC',
      },
      {
        name: 'SYSTEM_HEALTH',
        description: 'Audits database connection latency, storage, and application health.',
        schedule: 'Hourly',
      },
    ];

    const jobsWithStats = jobDefinitions.map((job) => {
      const logsForJob = recentLogs.filter((l) => l.jobName === job.name);
      const lastRun = logsForJob[0] || null;
      const successCount = logsForJob.filter((l) => l.status === 'COMPLETED').length;
      const failureCount = logsForJob.filter((l) => l.status === 'FAILED').length;

      return {
        ...job,
        lastRunAt: lastRun?.startedAt || null,
        lastStatus: lastRun?.status || 'IDLE',
        durationMs: lastRun?.durationMs || null,
        successCount,
        failureCount,
        lastError: lastRun?.errors ? JSON.parse(lastRun.errors)[0] : null,
      };
    });

    return NextResponse.json({
      success: true,
      jobs: jobsWithStats,
      recentLogs,
      totalJobLogs,
    });
  } catch (error: any) {
    console.error('[Jobs GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch job registry' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SESSION_SECRET;
  const isCronAuth = authHeader && (authHeader === `Bearer ${cronSecret}` || authHeader === cronSecret);

  if (!isCronAuth && !isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin or Cron Bearer token required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobName, runId } = body;

    if (!jobName) {
      return NextResponse.json({ error: 'Job name is required' }, { status: 400 });
    }

    const result = await executeJob(jobName, runId);

    return NextResponse.json({
      success: result.success,
      logId: result.logId,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error('[Jobs POST Error]', error);
    return NextResponse.json({ error: 'Failed to trigger job execution' }, { status: 500 });
  }
}
