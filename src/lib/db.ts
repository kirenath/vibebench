import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

// Initialize postgres client. Use `const sql = postgres(connectionString)`
// We set `ssl: 'require'` which is typically needed for Supabase.
export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
});
