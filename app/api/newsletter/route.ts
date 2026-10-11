import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(subscribers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limit: 5 newsletter subscriptions per 10 minutes per IP
    const rateLimit = checkRateLimit(`newsletter:${clientIp}`, {
      windowMs: 10 * 60 * 1000,
      max: 5,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: { status: 'SUBSCRIBED' },
      create: { email: cleanEmail, status: 'SUBSCRIBED' },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
      id: subscriber.id,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
