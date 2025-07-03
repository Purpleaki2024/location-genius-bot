// Local type definitions for Supabase client
export interface SupabaseClient {
  from(table: string): any;
  rpc(functionName: string, params: any): any;
}

export function createClient(url: string, key: string, options?: any): SupabaseClient;

// Dummy implementation for Supabase client
export function createClient(url: string, key: string, options?: any): any {
  return {
    from: (table: string) => ({ select: () => ({}) }),
    rpc: (functionName: string, params: any) => ({})
  };
}
