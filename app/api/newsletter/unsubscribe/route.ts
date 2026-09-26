import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token && !email) {
      return NextResponse.json({ error: 'Unsubscribe token or email is required' }, { status: 400 });
    }

    const where: any = token ? { token } : { email: email?.trim().toLowerCase() };

    const subscriber = await prisma.newsletterSubscriber.findFirst({ where });
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber record not found or already unsubscribed' }, { status: 404 });
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed from the BlogWeb904 newsletter.',
    });
  } catch (error: any) {
    console.error('[Newsletter Unsubscribe Error]', error);
    return NextResponse.json({ error: 'Failed to process unsubscribe request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token && !email) {
      return NextResponse.json({ error: 'Token or email is required' }, { status: 400 });
    }

    const where: any = token ? { token } : { email: email?.trim().toLowerCase() };

    const subscriber = await prisma.newsletterSubscriber.findFirst({ where });
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from all email newsletters.',
    });
  } catch (error: any) {
    console.error('[Newsletter Unsubscribe POST Error]', error);
    return NextResponse.json({ error: 'Failed to process unsubscribe request' }, { status: 500 });
  }
}
