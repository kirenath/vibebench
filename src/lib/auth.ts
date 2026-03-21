import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET, JWT_EXPIRY } from "./constants";

const COOKIE_NAME = "vibebench_admin_token";

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function signToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export function getCookieOptions(secure: boolean) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}

export { COOKIE_NAME };
