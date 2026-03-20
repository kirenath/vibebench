import { NextResponse } from "next/server";
import { getMissingServerEnvKeys } from "@/lib/env";
import { getBootstrapStats } from "@/lib/queries/bootstrap";

export async function GET() {
  const missingEnvKeys = getMissingServerEnvKeys();
  const stats = await getBootstrapStats();

  return NextResponse.json(
    {
      ok: missingEnvKeys.length === 0 && stats.connectionStatus === "connected",
      env: {
        ready: missingEnvKeys.length === 0,
        missingKeys: missingEnvKeys
      },
      database: stats
    },
    {
      status:
        missingEnvKeys.length === 0 && stats.connectionStatus === "connected" ? 200 : 503
    }
  );
}
