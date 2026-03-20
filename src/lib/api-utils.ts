import { NextResponse } from "next/server";
import { getAdminFromCookie } from "./auth";
import { ERROR_CODES } from "./constants";

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function error(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function notFound(message = "Resource not found") {
  return error(ERROR_CODES.NOT_FOUND, message, 404);
}

export function unauthorized(message = "Authentication required") {
  return error(ERROR_CODES.UNAUTHORIZED, message, 401);
}

export function forbidden(message = "Forbidden") {
  return error(ERROR_CODES.FORBIDDEN, message, 403);
}

export function validationError(message: string) {
  return error(ERROR_CODES.VALIDATION_ERROR, message, 400);
}

export function conflict(message: string) {
  return error(ERROR_CODES.CONFLICT, message, 409);
}

export function internalError(message = "Internal server error") {
  return error(ERROR_CODES.INTERNAL_ERROR, message, 500);
}

export async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) return null;
  return admin;
}
