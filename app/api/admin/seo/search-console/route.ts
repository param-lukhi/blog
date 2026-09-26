import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { getSearchConsoleStatus } from '@/lib/searchConsole';
import { executeJob } from '@/lib/jobs/registry';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '28d';

  const status = getSearchConsoleStatus();

  // Calculate date boundary based on period filter
  const daysMap: Record<string, number> = {
    '7d': 7,
    '28d': 28,
    '3m': 90,
    '6m': 180,
    '12m': 365,
  };
  const days = daysMap[period] || 28;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const performanceRecords = await prisma.searchPerformance.findMany({
    where: { date: { gte: startDate } },
    orderBy: { clicks: 'desc' },
    take: 100,
  });

  const totalClicks = performanceRecords.reduce((acc, r) => acc + r.clicks, 0);
  const totalImpressions = performanceRecords.reduce((acc, r) => acc + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = performanceRecords.length > 0 
    ? performanceRecords.reduce((acc, r) => acc + r.position, 0) / performanceRecords.length 
    : 0;

  // Group top queries
  const topQueries = performanceRecords.slice(0, 20).map(r => ({
    query: r.query,
    page: r.page,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  return NextResponse.json({
    status,
    period,
    totalRecords: performanceRecords.length,
    metrics: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCtr,
      position: avgPosition,
    },
    topQueries,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const runResult = await executeJob('SEARCH_CONSOLE_SYNC');
  return NextResponse.json(runResult);
}
