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
    upsert(values: Record<string, unknown>): Promise<{ error: Error | null }>;
  };
  rpc(functionName: string, params: Record<string, unknown>): Promise<{ error: Error | null }>;
}

export interface SearchResult {
  data: SupabaseLocation[] | null;
  error: Error | null;
}

export interface TelegramResponse {
  chat_id: number;
  text: string;
  parse_mode?: string;
}

export interface LogActivityData {
  activity_type: string;
  telegram_user_id?: string;
  query?: string;
  latitude?: string;
  longitude?: string;
  query_type: string;
  created_at?: string;
}

export interface LogSearchParams {
  query?: string;
  telegramUserId?: string;
  latitude?: string;
  longitude?: string;
  queryType: string;
}

export interface LogStat {
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  count: number;
}

export interface CommandStat {
  command: string;
  usage_count: number;
  avg_duration_ms: number;
}

export interface ErrorSummary {
  command?: string;
  count: number;
  last_occurrence: string;
}

// User state management for multi-step commands
export interface UserState {
  id: string;
  telegram_user_id: string;
  state: 'start' | 'awaiting_location' | 'awaiting_location_numbers';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// Phone number data structure
export interface PhoneNumberEntry {
  id: string;
  phone_number: string;
  user_name?: string;
  latitude: number;
  longitude: number;
  created_at: string;
  is_active: boolean;
}

// Enhanced location response for number searches
export interface NumberSearchResult {
  phone_number: string;
  user_name: string;
  distance_km?: number;
  latitude: number;
  longitude: number;
}