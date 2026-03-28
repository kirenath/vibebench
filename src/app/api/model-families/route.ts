import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendor_id");

  let sql = "SELECT * FROM model_families";
  const params: unknown[] = [];

  if (vendorId) {
    sql += " WHERE vendor_id = $1";
    params.push(vendorId);
  }

  sql += " ORDER BY sort_order, name";

  const result = await query(sql, params);
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
  const { id, vendor_id, name, description, sort_order, metadata } = body;

  const result = await query(
    `INSERT INTO model_families (id, vendor_id, name, description, sort_order, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      vendor_id,
      name,
      description ?? null,
      sort_order ?? 0,
      JSON.stringify(metadata ?? {}),
    ],
  );

  return NextResponse.json({ success: true, data: result.rows[0] });
}
