import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Shared, browser-safe Supabase client initialized with the project's
 * public URL and anon key. Used for managing client-side authentication.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
