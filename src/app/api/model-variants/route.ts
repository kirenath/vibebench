import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const familyId = searchParams.get("family_id");
  const isAdmin = await requireAdmin();

  let sql: string;
  const params: unknown[] = [];

  if (isAdmin) {
    sql = "SELECT * FROM model_variants";
  } else {
    sql = `SELECT mv.*
           FROM model_variants mv
           WHERE EXISTS (
             SELECT 1
             FROM submissions s
             WHERE s.model_variant_id = mv.id
               AND s.is_published = true
           )`;
  }

  const conditions: string[] = [];
  let paramIndex = 1;

  if (familyId) {
    if (isAdmin) {
      conditions.push(`family_id = $${paramIndex}`);
    } else {
      conditions.push(`mv.family_id = $${paramIndex}`);
    }
    params.push(familyId);
    paramIndex++;
  }

  if (conditions.length > 0) {
    sql += " AND " + conditions.join(" AND ");
  }

  if (isAdmin) {
    sql += " ORDER BY sort_order, name";
  } else {
    sql += " ORDER BY mv.sort_order, mv.name";
  }

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
  const { id, family_id, name, description, sort_order, metadata } = body;

  const result = await query(
    `INSERT INTO model_variants (id, family_id, name, description, sort_order, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      family_id,
      name,
      description ?? null,
      sort_order ?? 0,
      JSON.stringify(metadata ?? {}),
    ],
  );

  return NextResponse.json({ success: true, data: result.rows[0] });
}
