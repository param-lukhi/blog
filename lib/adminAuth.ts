import { NextRequest } from 'next/server';
import { isAuthorizedAdmin, getAdminSession } from '@/lib/auth';

export async function requireAdminAuth(req?: NextRequest): Promise<{ authorized: boolean; username?: string; message?: string; status: number }> {
  // Check session cookie
  if (isAuthorizedAdmin()) {
    const session = getAdminSession();
    return { authorized: true, username: session?.email || 'admin', status: 200 };
  }

  // Check Bearer authorization header (e.g. from cron or internal jobs)
  if (req) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SESSION_SECRET;
    if (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return { authorized: true, username: 'cron_worker', status: 200 };
    }
  }

  return { authorized: false, message: 'Unauthorized: Admin authentication required', status: 401 };
}

export { isAuthorizedAdmin, getAdminSession };
