import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'OPEN';

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    const [issues, criticalCount, warningCount, resolvedCount] = await Promise.all([
      prisma.seoIssue.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        take: 50,
      }),
      prisma.seoIssue.count({ where: { severity: 'CRITICAL', status: 'OPEN' } }),
      prisma.seoIssue.count({ where: { severity: 'WARNING', status: 'OPEN' } }),
      prisma.seoIssue.count({ where: { status: 'RESOLVED' } }),
    ]);

    return NextResponse.json({
      success: true,
      issues,
      summary: {
        criticalCount,
        warningCount,
        resolvedCount,
        totalOpen: criticalCount + warningCount,
      },
    });
  } catch (error: any) {
    console.error('[SEO Issues GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch SEO issues' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { issueId, status } = body;

    if (!issueId || !status) {
      return NextResponse.json({ error: 'Issue ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.seoIssue.update({
      where: { id: issueId },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    });

    await logActivity({
      action: 'UPDATE',
      entity: 'SETTING',
      entityId: issueId,
      details: {
        summary: `SEO Issue ${issueId} updated to ${status}`,
      },
    });

    return NextResponse.json({ success: true, issue: updated });
  } catch (error: any) {
    console.error('[SEO Issues PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update SEO issue' }, { status: 500 });
  }
}
