interface Env {
  VITE_API_BASE_URL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

const requiredEnvVars = [
  "VITE_API_BASE_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

export const env: Env = (() => {
  const missing: string[] = [];
  const parsedEnv = {} as Record<string, string>;

  for (const key of requiredEnvVars) {
    const value = import.meta.env[key];
    if (!value) {
      missing.push(key);
    } else {
      parsedEnv[key] = value;
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(", ")}. Please check your .env file.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return parsedEnv as unknown as Env;
})();
