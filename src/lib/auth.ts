import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRY = "7d";
const COOKIE_NAME = "vb_admin_token";

export interface AdminPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export function signToken(): string {
  return jwt.sign({ role: "admin" } as Pick<AdminPayload, "role">, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function adminCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}
