import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isAuthorizedAdmin()) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let user = null;
    try {
      const configuredEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      if (configuredEmail) {
        user = await db.user.findFirst({
          where: {
            email: { equals: configuredEmail, mode: 'insensitive' },
          },
          select: { name: true, email: true, role: true },
        });
      }
      if (!user) {
        user = await db.user.findFirst({
          where: { role: 'ADMIN', status: 'ACTIVE' },
          select: { name: true, email: true, role: true },
        });
      }
    } catch (e) {
      console.warn('[AUTH] Error fetching user profile:', e);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: user?.name || 'Administrator',
        email: user?.email || process.env.ADMIN_EMAIL || 'admin@blogweb904.com',
        role: user?.role || 'ADMIN',
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
