// Dummy implementation for Supabase client
export function createClient(url: string, key: string, options?: any): any {
  return {
    from: (table: string) => ({ select: () => ({}) }),
    rpc: (functionName: string, params: any) => ({})
  };
}
