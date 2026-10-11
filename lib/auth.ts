import { cookies } from 'next/headers';
import { verifyAdminSessionToken, createAdminSessionToken } from './session';

export { createAdminSessionToken, verifyAdminSessionToken };

/**
 * Checks whether the incoming request contains a valid admin session cookie.
 */
export function isAuthorizedAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    return verifyAdminSessionToken(sessionToken);
  } catch {
    return false;
  }
}
