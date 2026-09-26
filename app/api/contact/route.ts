import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: 5 contact form submissions per 10 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`contact_${clientIp}`, 5, 10 * 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many contact requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message must be at least 5 characters long' }, { status: 400 });
    }

    if (message.trim().length > 5000) {
      return NextResponse.json({ error: 'Message cannot exceed 5000 characters' }, { status: 400 });
    }

    // Log server-side contact request securely without exposing secrets
    console.log(`[Contact Form Received] From: ${name.trim()} (${email.trim()}), Subject: ${subject ? String(subject).trim() : 'General Inquiry'}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message. Our editorial team will review your inquiry.',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing contact form' }, { status: 500 });
  }
}
