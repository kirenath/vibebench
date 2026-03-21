import { query } from "@/lib/db";
import { json, errorResponse, withAdmin } from "@/lib/api-helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const rows = await query(`SELECT * FROM channels ORDER BY sort_order, name`);
  return json(rows);
}

export async function POST(request: NextRequest) {
  return withAdmin(async () => {
    const body = await request.json();
    const { id, name, description, sort_order, metadata } = body;
    if (!id || !name) return errorResponse("id and name are required");

    const rows = await query(
      `INSERT INTO channels (id, name, description, sort_order, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, description || null, sort_order || 0, JSON.stringify(metadata || {})]
    );
    return json(rows[0], 201);
  });
}
