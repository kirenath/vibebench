import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const result = await supabase
      .from("challenges")
      .select("id, title, description, is_published, published_at, updated_at")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (result.error) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      count: result.data.length,
      data: result.data
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
