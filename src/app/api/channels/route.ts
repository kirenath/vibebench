import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET() {
  const result = await query(
    "SELECT * FROM channels ORDER BY sort_order, name",
  );
  return NextResponse.json({ success: true, data: result.rows });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { id, name, description, sort_order, metadata } = body;

  const result = await query(
    `INSERT INTO channels (id, name, description, sort_order, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      id,
      name,
      description ?? null,
      sort_order ?? 0,
      JSON.stringify(metadata ?? {}),
    ],
  );

  return NextResponse.json({ success: true, data: result.rows[0] });
}
