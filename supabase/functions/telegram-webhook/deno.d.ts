// Deno types for Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

export {};
