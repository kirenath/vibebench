import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const vendorId = new URL(request.url).searchParams.get("vendor_id");
    let query = `SELECT mf.*, v.name as vendor_name FROM model_families mf JOIN vendors v ON v.id = mf.vendor_id`;
    const params: string[] = [];
    if (vendorId) {
      query += ` WHERE mf.vendor_id = $1`;
      params.push(vendorId);
    }
    query += ` ORDER BY mf.sort_order, mf.name`;
    const { rows } = await db.query(query, params);
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
    if (!body.id || !body.vendor_id || !body.name)
      return validationError("id, vendor_id, and name are required");
    const { rows } = await db.query(
      `INSERT INTO model_families (id, vendor_id, name, description, sort_order, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [body.id, body.vendor_id, body.name, body.description || null, body.sort_order || 0, JSON.stringify(body.metadata || {})]
    );
    return success(rows[0], 201);
  } catch (e: any) {
    if (e.code === "23505") return validationError("Model family ID already exists");
    if (e.code === "23503") return validationError("Vendor not found");
    return internalError();
  }
}
