import { cookies } from 'next/headers';

export function isAuthorizedAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    const expectedSecret = process.env.ADMIN_SESSION_SECRET;
    
    if (!expectedSecret || !sessionToken) {
      return false;
    }
    
    return sessionToken === expectedSecret;
  } catch {
    return false;
  }
}

