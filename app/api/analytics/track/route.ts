import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit: 120 tracks per minute per IP to prevent spam flood
    const rateLimit = checkRateLimit(`track_${clientIp}`, 120, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { eventType, targetId, targetType, path, keyword, referrer } = body;

    const allowedEvents = ['PAGE_VIEW', 'AFFILIATE_CLICK', 'PRODUCT_VIEW', 'SEARCH'];
    const validEventType = eventType && allowedEvents.includes(String(eventType)) ? String(eventType) : 'PAGE_VIEW';

    const userAgent = request.headers.get('user-agent') || '';

    await db.analytics.create({
      data: {
        eventType: validEventType,
        targetId: targetId ? String(targetId).slice(0, 100) : null,
        targetType: targetType ? String(targetType).slice(0, 50) : null,
        path: path ? String(path).slice(0, 500) : null,
        keyword: keyword ? String(keyword).slice(0, 100) : null,
        referrer: referrer ? String(referrer).slice(0, 500) : (request.headers.get('referer')?.slice(0, 500) || null),
        userAgent: userAgent.slice(0, 255),
      },
    });

    // If blog view, increment views counter
    if (validEventType === 'PAGE_VIEW' && targetType === 'BLOG' && targetId) {
      await db.blog.update({
        where: { id: targetId },
        data: { views: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}
