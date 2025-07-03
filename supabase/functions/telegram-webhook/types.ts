// Type definitions for Telegram Webhook function

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramLocation {
  longitude: number;
  latitude: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  date: number;
  chat: TelegramChat;
  text?: string;
  location?: TelegramLocation;
  reply_to_message?: TelegramMessage;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface SupabaseLocation {
  id: string;
  name: string;
  address: string;
  type: string;
  rating: number;
  lat: number;
  lng: number;
  visits: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface SupabaseClient {
  from(table: string): {
    select(columns?: string): {
      ilike(column: string, pattern: string): {
        eq(column: string, value: unknown): Promise<{ data: SupabaseLocation[] | null; error: Error | null }>;
        limit(count: number): Promise<{ data: SupabaseLocation[] | null; error: Error | null }>;
      };
      eq(column: string, value: unknown): {
        limit(count: number): Promise<{ data: SupabaseLocation[] | null; error: Error | null }>;
      };
      limit(count: number): Promise<{ data: SupabaseLocation[] | null; error: Error | null }>;
    };
    update(values: Partial<SupabaseLocation>): {
      eq(column: string, value: unknown): Promise<{ error: Error | null }>;
    };
    insert(values: Record<string, unknown>): Promise<{ error: Error | null }>;
  };
  rpc(functionName: string, params: Record<string, unknown>): Promise<{ error: Error | null }>;
}

export interface LogSearchParams {
  query?: string;
  telegramUserId?: string;
  latitude?: string;
  longitude?: string;
  queryType: string;
}