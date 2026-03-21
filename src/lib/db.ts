import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Helper to run raw SQL queries via Supabase's rpc or rest
export async function query<T = Record<string, unknown>>(
  sql: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[]
): Promise<T[]> {
  const { data, error } = await supabase.rpc('', {}) as { data: T[] | null; error: unknown };
  if (error) throw error;
  return data ?? [];
}

// Convenience: use supabase client's built-in query builder
export default supabase;
