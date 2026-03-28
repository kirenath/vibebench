import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { vendor_id, name, description, sort_order, metadata } = body;

  const result = await query(
    `UPDATE model_families
     SET vendor_id   = COALESCE($1, vendor_id),
         name        = COALESCE($2, name),
         description = COALESCE($3, description),
         sort_order  = COALESCE($4, sort_order),
         metadata    = COALESCE($5, metadata)
     WHERE id = $6
     RETURNING *`,
    [vendor_id ?? null, name ?? null, description ?? null, sort_order ?? null, metadata != null ? JSON.stringify(metadata) : null, id],
  );

  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: result.rows[0] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const result = await query(
    "DELETE FROM model_families WHERE id = $1 RETURNING id",
    [id],
  );

  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
