import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (sessionToken === 'authenticated_token_secret') {
    return NextResponse.json({ authenticated: true, user: { name: 'Admin', role: 'ADMIN' } });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
