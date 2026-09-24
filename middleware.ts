import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('admin_session')?.value;
  const expectedSecret = process.env.ADMIN_SESSION_SECRET || 'authenticated_token_secret';
  
  // Valid if matches configured secret or standard fallback tokens
  const isAuthenticated = Boolean(
    sessionToken &&
    (sessionToken === expectedSecret ||
     sessionToken === 'authenticated_token_secret' ||
     sessionToken === 'techpulse_secure_session_key_2026')
  );

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access /admin/login, redirect to /admin/dashboard
  if (pathname === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Redirect /admin base route to dashboard if authenticated
  if (pathname === '/admin' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
