import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createServiceRoleClient() {
  const serverEnv = getServerEnv();

  return createClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
