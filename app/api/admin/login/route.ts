import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createAdminSessionToken } from '@/lib/session';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limit: max 5 login attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`login:${clientIp}`, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });

    if (!rateLimit.success) {
      const waitMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${waitMinutes} minute(s).` },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const emailInput = body.email || body.username || '';
    const passwordInput = body.password || '';

    if (!emailInput || !passwordInput) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const normalizedEmail = String(emailInput).trim().toLowerCase();
    const allowedAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD || '';

    let isPasswordValid = false;
    let user: any = null;

    // 1. Check user in database
    try {
      user = await db.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive',
          },
        },
      });
    } catch (dbError) {
      console.warn('[AUTH] Database lookup warning:', dbError);
    }

    // 2. Validate password against Database User if found
    if (user && user.status === 'ACTIVE' && user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(passwordInput, user.password);
      } else {
        // Plain text fallback / migration to hashed password
        isPasswordValid = (user.password === passwordInput);
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(passwordInput, 10);
          await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          }).catch(() => {});
        }
      }
    }

    // 3. Fallback to process.env if database user matching or env matching
    if (!isPasswordValid && envPassword) {
      const isEmailMatch = !allowedAdminEmail || normalizedEmail === allowedAdminEmail;
      const isPassMatch = passwordInput === envPassword || passwordInput.trim() === envPassword.trim();
      if (isEmailMatch && isPassMatch) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        name: user?.name || 'Admin',
        email: normalizedEmail,
        role: user?.role || 'ADMIN',
      },
    });

    // 4. Generate cryptographically signed HMAC session token
    const signedToken = createAdminSessionToken(normalizedEmail);

    response.cookies.set('admin_session', signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[AUTH] Login handler error:', error);
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
}
