// Proper Supabase client for Deno Edge Function
import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import type { SupabaseClient } from "./types.ts";

export function createClient(url: string, key: string): SupabaseClient {
  return createSupabaseClient(url, key) as SupabaseClient;
}
