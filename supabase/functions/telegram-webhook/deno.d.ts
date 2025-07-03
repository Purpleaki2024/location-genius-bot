// Deno types for Edge Functions
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
      toObject(): Record<string, string>;
    };
  };
}

export {};
