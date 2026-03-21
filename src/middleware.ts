import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const sandboxBase = process.env.SANDBOX_BASE_URL || '';

  // --- Sandbox domain routing ---
  // In production, sandbox domain should only serve /s/ paths
  if (sandboxBase && host && sandboxBase.includes(host) && !pathname.startsWith('/s/')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // --- Admin auth guard ---
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Admin API auth guard ---
  if (pathname.startsWith('/api/') && request.method !== 'GET') {
    // Public endpoints that don't need auth
    const publicPaths = ['/api/auth/login', '/api/auth/logout'];
    if (!publicPaths.includes(pathname)) {
      const admin = await getAdminFromRequest(request);
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/s/:path*',
  ],
};
