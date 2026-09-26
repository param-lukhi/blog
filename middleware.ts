import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verifyEdgeSession(token: string | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  // Strict blacklist: immediately reject legacy hardcoded fallback strings
  if (
    token === 'authenticated_token_secret' ||
    token === 'techpulse_secure_session_key_2026' ||
    token === 'admin' ||
    token === 'true'
  ) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return false;

  try {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET || 'dev_ephemeral_secret_key_change_in_production_8f7b2c1d9e';
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url signature to Uint8Array
    let base64 = providedSignature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binarySig = atob(base64);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const dataBytes = encoder.encode(encodedPayload);
    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, dataBytes);

    if (!isValid) return false;

    // Decode payload and verify expiration
    let payloadBase64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    while (payloadBase64.length % 4) payloadBase64 += '=';
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('admin_session')?.value;
  const isAuthenticated = await verifyEdgeSession(sessionToken);

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
