import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

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

    const [errors, criticalErrorsCount, totalErrors] = await Promise.all([
      prisma.systemErrorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.systemErrorLog.count({ where: { severity: 'CRITICAL', status: 'OPEN' } }),
      prisma.systemErrorLog.count(),
    ]);

    return NextResponse.json({
      success: true,
      errors,
      criticalErrorsCount,
      totalErrors,
    });
  } catch (error: any) {
    console.error('[System Errors GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch error logs' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { errorId, status } = body;

    if (!errorId || !status) {
      return NextResponse.json({ error: 'Error ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.systemErrorLog.update({
      where: { id: errorId },
      data: { status },
    });

    return NextResponse.json({ success: true, errorLog: updated });
  } catch (error: any) {
    console.error('[System Errors PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update error status' }, { status: 500 });
  }
}
