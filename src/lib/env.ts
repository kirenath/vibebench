const requiredServerKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

function readEnv(key: string): string | undefined {
  const value = process.env[key];

  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireEnv(key: (typeof requiredServerKeys)[number]): string {
  const value = readEnv(key);

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const publicEnv = {
  appUrl: readEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  supabaseUrl: readEnv("NEXT_PUBLIC_SUPABASE_URL")
};

export function getMissingServerEnvKeys(): string[] {
  return requiredServerKeys.filter((key) => !readEnv(key));
}

export function getServerEnv() {
  return {
    supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    databaseUrl: readEnv("DATABASE_URL")
  };
}
