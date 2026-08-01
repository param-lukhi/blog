import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Default admin credentials: admin / admin123 (or any custom set password)
    if ((username === 'admin' || username === 'admin@techpulse.com') && (password === 'admin123' || password === 'admin')) {
      const response = NextResponse.json({ success: true, user: { name: 'Admin', role: 'ADMIN' } });
      
      // Set session cookie
      response.cookies.set('admin_session', 'authenticated_token_secret', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
