import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Protect admin routes
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  const url = request.nextUrl.clone();
  
  if (!token) {
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    await jose.jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    // Invalid token
    url.pathname = '/admin/login';
    // Clear the invalid token cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('admin_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/admin',
    '/admin/challenges',
    '/admin/models',
    '/admin/submissions',
  ],
};
