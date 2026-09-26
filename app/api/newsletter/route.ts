import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        preferences: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ success: true, count: subscribers.length, subscribers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`newsletter_${clientIp}`, 5, 10 * 60 * 1000);

    if (!rateLimit) {
      return NextResponse.json(
        { error: 'Too many subscription requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, preferences = ['reviews', 'drops', 'comparisons', 'digest'] } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase().slice(0, 150);
    const prefString = Array.isArray(preferences) ? preferences.join(',') : String(preferences);
    const uniqueToken = 'tok_' + crypto.randomBytes(16).toString('hex');

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: {
        status: 'SUBSCRIBED',
        preferences: prefString,
        updatedAt: new Date(),
      },
      create: {
        email: cleanEmail,
        preferences: prefString,
        status: 'SUBSCRIBED',
        token: uniqueToken,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing to BlogWeb904 updates!',
        preferences: subscriber.preferences.split(','),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Newsletter Subscribe Error]', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
