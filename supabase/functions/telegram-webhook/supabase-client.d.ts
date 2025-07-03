// Refined type definitions for Supabase client
export interface SupabaseClient {
  from(table: string): any;
  rpc(functionName: string, params: any): any;
}

export function createClient(url: string, key: string, options?: any): SupabaseClient;
