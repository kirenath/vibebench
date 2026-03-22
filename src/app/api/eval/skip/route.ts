import { NextRequest, NextResponse } from "next/server";
import { jsonOk } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  // Currently, the skip endpoint acts as a stub / logging point.
  // It does not record into the database to keep the DB clean from non-votes, 
  // but it exists to be symmetrical and can be extended to track skips later.
  
  try {
    // We could optionally parse the body to log it.
    // const body = await request.json();
    return jsonOk({ skipped: true });
  } catch (err: any) {
    return jsonOk({ skipped: true }); // even if JSON is broken, we just acknowledge skip
  }
}
