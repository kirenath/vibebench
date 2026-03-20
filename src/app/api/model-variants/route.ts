import { NextRequest } from "next/server";
import db from "@/lib/db";
import { success, validationError, unauthorized, internalError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const familyId = new URL(request.url).searchParams.get("family_id");
    let query: string;
    const params: string[] = [];

    if (admin) {
      query = `SELECT mv.*, mf.name as family_name, v.name as vendor_name
               FROM model_variants mv
               JOIN model_families mf ON mf.id = mv.family_id
               JOIN vendors v ON v.id = mf.vendor_id`;
      if (familyId) {
        query += ` WHERE mv.family_id = $1`;
        params.push(familyId);
      }
    } else {
      query = `SELECT DISTINCT mv.*, mf.name as family_name, v.name as vendor_name
               FROM model_variants mv
               JOIN model_families mf ON mf.id = mv.family_id
               JOIN vendors v ON v.id = mf.vendor_id
               JOIN submissions s ON s.model_variant_id = mv.id AND s.is_published = true`;
      if (familyId) {
        query += ` AND mv.family_id = $1`;
        params.push(familyId);
      }
    }
    query += ` ORDER BY mv.sort_order, mv.name`;
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
    if (!body.id || !body.family_id || !body.name)
      return validationError("id, family_id, and name are required");
    const { rows } = await db.query(
      `INSERT INTO model_variants (id, family_id, name, description, sort_order, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [body.id, body.family_id, body.name, body.description || null, body.sort_order || 0, JSON.stringify(body.metadata || {})]
    );
    return success(rows[0], 201);
  } catch (e: any) {
    if (e.code === "23505") return validationError("Model variant ID already exists");
    if (e.code === "23503") return validationError("Model family not found");
    return internalError();
  }
}
