import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";

export async function GET() {
  try {
    const { rows } = await db.query(`SELECT * FROM channels ORDER BY sort_order, name`);
    return success(rows);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return unauthorized();
    const body = await request.json();
    if (!body.id || !body.name) return validationError("id and name are required");
    const { rows } = await db.query(
      `INSERT INTO channels (id, name, description, sort_order, metadata)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.id, body.name, body.description || null, body.sort_order || 0, JSON.stringify(body.metadata || {})]
    );
    return success(rows[0], 201);
  } catch (e: any) {
    if (e.code === "23505") return validationError("Channel ID already exists");
    return internalError();
  }
}
