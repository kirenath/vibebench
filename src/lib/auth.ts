import { SignJWT, jwtVerify } from 'jose';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
const COOKIE_NAME = 'vb_admin_token';
const JWT_EXPIRY = '7d';

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return compare(plain, hash);
}

export async function signJWT(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getAdminFromCookies(): Promise<Record<string, unknown> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function getAdminFromRequest(request: NextRequest): Promise<Record<string, unknown> | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export function getAuthCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export function getClearCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  };
}

export { COOKIE_NAME };
