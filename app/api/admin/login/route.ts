import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. Rate limiting: 5 login attempts per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`login_${clientIp}`, 5, 15 * 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.resetInSeconds / 60)} minutes.` },
        { status: 429 }
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

    // 2. Check user in database
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

    // 3. Validate password against Database User if found
    if (user && user.status === 'ACTIVE' && user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(passwordInput, user.password);
      } else {
        // Plain text migration to secure bcrypt hash
        isPasswordValid = user.password === passwordInput;
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(passwordInput, 10);
          await db.user
            .update({
              where: { id: user.id },
              data: { password: hashedPassword },
            })
            .catch(() => {});
        }
      }
    }

    // 4. Fallback to process.env admin configuration if database user not matched
    if (!isPasswordValid && envPassword) {
      const isEmailMatch = !allowedAdminEmail || normalizedEmail === allowedAdminEmail;
      const isPassMatch = passwordInput === envPassword || passwordInput.trim() === envPassword.trim();
      if (isEmailMatch && isPassMatch) {
        isPasswordValid = true;
        user = {
          id: 'env_admin_user',
          name: 'Administrator',
          email: normalizedEmail,
          role: 'ADMIN',
        };
      }
    }

    if (!isPasswordValid || !user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // 5. Generate cryptographically signed HMAC-SHA256 session token
    const sessionToken = createSessionToken({
      id: user.id || 'admin_user',
      email: normalizedEmail,
      role: user.role || 'ADMIN',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        name: user?.name || 'Administrator',
        email: normalizedEmail,
        role: user?.role || 'ADMIN',
      },
    });

    // 6. Set secure HTTP-only session cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[AUTH] Login handler error:', error);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
  }
}
