import { cookies } from 'next/headers';

export function isAuthorizedAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    const expectedSecret = process.env.ADMIN_SESSION_SECRET || 'techpulse_secure_session_key_2026';
    
    if (!sessionToken) {
      return false;
    }
    
    return sessionToken === expectedSecret;
  } catch {
    return false;
  }
}

