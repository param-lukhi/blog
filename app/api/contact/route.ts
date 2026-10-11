import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limit: 5 contact requests per 15 minutes per IP
    const rateLimit = checkRateLimit(`contact:${clientIp}`, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many messages submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 120) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 5000) {
      return NextResponse.json({ error: 'Message must be between 5 and 5000 characters' }, { status: 400 });
    }

    console.log(`[Contact Form Received] From: ${name.trim()} (${email.trim()}), Subject: ${subject || 'General Inquiry'}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message. The BlogWeb904 editorial team will review your inquiry.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing contact form' }, { status: 500 });
  }
}
