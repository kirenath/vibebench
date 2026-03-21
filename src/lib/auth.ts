import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;
const COOKIE_NAME = "vb_admin_token";
const JWT_EXPIRES_IN = "7d";

export interface AdminPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export async function verifyPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<AdminPayload> {
  const admin = await getAdminFromCookie();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
