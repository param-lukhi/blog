import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getAdminSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let user = null;
    try {
      if (session.sub && session.sub !== 'env_admin_user') {
        user = await db.user.findUnique({
          where: { id: session.sub },
          select: { name: true, email: true, role: true, status: true },
        });
      } else if (session.email) {
        user = await db.user.findFirst({
          where: { email: { equals: session.email, mode: 'insensitive' } },
          select: { name: true, email: true, role: true, status: true },
        });
      }
    } catch (e) {
      console.warn('[AUTH] Error fetching user profile in check-auth:', e);
    }

    // Check if user is active if found in DB
    if (user && user.status === 'INACTIVE') {
      return NextResponse.json({ authenticated: false, error: 'Account inactive' }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: user?.name || 'Administrator',
        email: user?.email || session.email,
        role: user?.role || session.role || 'ADMIN',
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
