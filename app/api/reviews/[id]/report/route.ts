import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const rateLimitKey = `report:${ip}`;
    if (!checkRateLimit(rateLimitKey, 10, 3600000)) {
      return NextResponse.json({ error: 'Too many reports submitted' }, { status: 429 });
    }

    const { id: reviewId } = params;
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const body = await req.json();
    const { reason = 'OTHER', details } = body;

    const validReasons = ['SPAM', 'ABUSE', 'MISLEADING', 'OFF_TOPIC', 'OTHER'];
    const normalizedReason = validReasons.includes(reason) ? reason : 'OTHER';

    const reporterIpHash = crypto.createHash('sha256').update(ip).digest('hex');

    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reason: normalizedReason,
        details: details ? String(details).slice(0, 500) : null,
        status: 'OPEN',
        reporterIpHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review report received and queued for editorial moderation.',
      reportId: report.id,
    });
  } catch (error: any) {
    console.error('[Review Report Error]', error);
    return NextResponse.json({ error: 'Failed to submit review report' }, { status: 500 });
  }
}
