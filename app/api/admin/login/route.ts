import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
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
        // Plain text fallback / migration
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

    // 4. Set secure HTTP-only session cookie
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'techpulse_secure_session_key_2026';
    response.cookies.set('admin_session', sessionSecret, {
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
