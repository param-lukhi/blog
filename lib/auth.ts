import { cookies } from 'next/headers';

export function isAuthorizedAdmin(): boolean {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  return sessionToken === 'authenticated_token_secret';
}
