import { NextResponse } from "next/server";
import { adminCookieOptions } from "@/lib/auth";
import { success } from "@/lib/api-utils";

export async function POST() {
  const opts = adminCookieOptions();
  const res = success({ message: "Logged out" });
  res.cookies.set(opts.name, "", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: 0,
  });
  return res;
}
