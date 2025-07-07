export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bot_logs: {
        Row: {
          chat_id: string | null
          command: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: number
          level: string
          message: string
          metadata: Json | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          command?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: number
          level: string
          message: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          command?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: number
          level?: string
          message?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bot_stats: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      location_searches: {
        Row: {
          created_at: string | null
          id: string
          latitude: string | null
          longitude: string | null
          query: string | null
          query_type: string | null
          telegram_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude?: string | null
          longitude?: string | null
          query?: string | null
          query_type?: string | null
          telegram_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: string | null
          longitude?: string | null
          query?: string | null
          query_type?: string | null
          telegram_user_id?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          active: boolean
          additional_info: string | null
          address: string
          code: string | null
          country: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          password: string | null
          phone_number: string | null
          postcode: string | null
          rating: number
          region: string | null
          type: string
          updated_at: string
          visits: number
        }
        Insert: {
          active?: boolean
          additional_info?: string | null
          address: string
          code?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          password?: string | null
          phone_number?: string | null
          postcode?: string | null
          rating?: number
          region?: string | null
          type: string
          updated_at?: string
          visits?: number
        }
        Update: {
          active?: boolean
          additional_info?: string | null
          address?: string
          code?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          password?: string | null
          phone_number?: string | null
          postcode?: string | null
          rating?: number
          region?: string | null
          type?: string
          updated_at?: string
          visits?: number
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      telegram_users: {
        Row: {
          first_name: string | null
          first_seen: string | null
          id: string
          last_name: string | null
          last_seen: string | null
          telegram_id: string
          username: string | null
        }
        Insert: {
          first_name?: string | null
          first_seen?: string | null
          id?: string
          last_name?: string | null
          last_seen?: string | null
          telegram_id: string
          username?: string | null
        }
        Update: {
          first_name?: string | null
          first_seen?: string | null
          id?: string
          last_name?: string | null
          last_seen?: string | null
          telegram_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          location_id: string | null
          message: string | null
          telegram_user_id: string | null
          telegram_username: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          location_id?: string | null
          message?: string | null
          telegram_user_id?: string | null
          telegram_username?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          location_id?: string | null
          message?: string | null
          telegram_user_id?: string | null
          telegram_username?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_increment_visits: {
        Args: { location_ids: number[] }
        Returns: undefined
      }
      cleanup_old_activities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_bot_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_bot_error_summary: {
        Args: { days_back?: number }
        Returns: {
          error_message: string
          command: string
          count: number
          last_occurrence: string
        }[]
      }
      get_bot_log_stats: {
        Args: { days_back?: number }
        Returns: {
          level: string
          count: number
          avg_duration_ms: number
        }[]
      }
      get_bot_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          value: number
        }[]
      }
      get_command_usage_stats: {
        Args: { days_back?: number }
        Returns: {
          command: string
          usage_count: number
          avg_duration_ms: number
          error_count: number
        }[]
      }
      get_telegram_user_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      get_template_by_type: {
        Args: { template_type: string }
        Returns: {
          id: string
          name: string
          content: string
          variables: Json
        }[]
      }
      increment_bot_stats: {
        Args: { stat_name: string; increment_by: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
