export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          address: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          rating: number
          type: string
          updated_at: string
          visits: number
        }
        Insert: {
          active?: boolean
          address: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          rating?: number
          type: string
          updated_at?: string
          visits?: number
        }
        Update: {
          active?: boolean
          address?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          rating?: number
          type?: string
          updated_at?: string
          visits?: number
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
      get_telegram_user_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
