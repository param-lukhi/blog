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
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    const [reviews, totalCount, reports, pendingCount] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          reports: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productReview.count({ where }),
      prisma.reviewReport.findMany({
        where: { status: 'OPEN' },
        include: {
          review: {
            include: { product: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.productReview.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      pendingCount,
      openReportsCount: reports.length,
    });
  } catch (error: any) {
    console.error('[Admin Reviews GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch reviews for moderation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reviewId, action, reportId } = body;

    // Handle Report resolution if specified
    if (reportId) {
      await prisma.reviewReport.update({
        where: { id: reportId },
        data: { status: action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED' },
      });
      return NextResponse.json({ success: true, message: 'Report updated' });
    }

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    if (action === 'DELETE') {
      await prisma.productReview.delete({ where: { id: reviewId } });
      await logActivity({
        action: 'DELETE',
        entity: 'PRODUCT',
        entityId: reviewId,
        details: {
          summary: `Deleted community review: ${reviewId}`,
        },
      });
      return NextResponse.json({ success: true, message: 'Review permanently deleted' });
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'HIDDEN', 'PENDING'];
    if (!validStatuses.includes(action)) {
      return NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
    }

    const updated = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        status: action,
        moderatedAt: new Date(),
        moderatedBy: 'Admin',
      },
    });

    await logActivity({
      action: 'APPROVE',
      entity: 'PRODUCT',
      entityId: reviewId,
      details: {
        summary: `Review moderation status updated to ${action}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Review status updated to ${action}`,
      review: updated,
    });
  } catch (error: any) {
    console.error('[Admin Reviews PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update review moderation status' }, { status: 500 });
  }
}
