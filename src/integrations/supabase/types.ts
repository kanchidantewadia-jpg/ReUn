export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cctv_footage: {
        Row: {
          created_at: string
          description: string | null
          footage_url: string
          id: string
          location: string | null
          missing_person_id: string
          recorded_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          footage_url: string
          id?: string
          location?: string | null
          missing_person_id: string
          recorded_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          footage_url?: string
          id?: string
          location?: string | null
          missing_person_id?: string
          recorded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "cctv_footage_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "authenticated_missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cctv_footage_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cctv_footage_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "public_missing_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          missing_person_id: string
          sender_id: string
          sender_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          missing_person_id: string
          sender_id: string
          sender_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          missing_person_id?: string
          sender_id?: string
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "authenticated_missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "public_missing_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_persons: {
        Row: {
          additional_info: string | null
          age: number | null
          clothing_description: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string
          distinguishing_features: string | null
          full_name: string
          gender: string | null
          height: string | null
          id: string
          last_seen_date: string
          last_seen_location: string
          photo_url: string | null
          status: Database["public"]["Enums"]["missing_status"]
          updated_at: string
          user_id: string
          visibility: string | null
          weight: string | null
        }
        Insert: {
          additional_info?: string | null
          age?: number | null
          clothing_description?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string
          distinguishing_features?: string | null
          full_name: string
          gender?: string | null
          height?: string | null
          id?: string
          last_seen_date: string
          last_seen_location: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"]
          updated_at?: string
          user_id: string
          visibility?: string | null
          weight?: string | null
        }
        Update: {
          additional_info?: string | null
          age?: number | null
          clothing_description?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string
          distinguishing_features?: string | null
          full_name?: string
          gender?: string | null
          height?: string | null
          id?: string
          last_seen_date?: string
          last_seen_location?: string
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"]
          updated_at?: string
          user_id?: string
          visibility?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          full_name: string
          id: string
          show_real_name: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          full_name: string
          id?: string
          show_real_name?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          full_name?: string
          id?: string
          show_real_name?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      authenticated_missing_persons: {
        Row: {
          additional_info: string | null
          age: number | null
          clothing_description: string | null
          created_at: string | null
          distinguishing_features: string | null
          full_name: string | null
          gender: string | null
          height: string | null
          id: string | null
          last_seen_date: string | null
          last_seen_location: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["missing_status"] | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          additional_info?: string | null
          age?: number | null
          clothing_description?: string | null
          created_at?: string | null
          distinguishing_features?: string | null
          full_name?: string | null
          gender?: string | null
          height?: string | null
          id?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"] | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          additional_info?: string | null
          age?: number | null
          clothing_description?: string | null
          created_at?: string | null
          distinguishing_features?: string | null
          full_name?: string | null
          gender?: string | null
          height?: string | null
          id?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"] | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      public_missing_persons: {
        Row: {
          additional_info: string | null
          age: number | null
          clothing_description: string | null
          created_at: string | null
          distinguishing_features: string | null
          full_name: string | null
          gender: string | null
          height: string | null
          id: string | null
          last_seen_date: string | null
          last_seen_location: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["missing_status"] | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          additional_info?: string | null
          age?: number | null
          clothing_description?: string | null
          created_at?: string | null
          distinguishing_features?: string | null
          full_name?: string | null
          gender?: string | null
          height?: string | null
          id?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"] | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          additional_info?: string | null
          age?: number | null
          clothing_description?: string | null
          created_at?: string | null
          distinguishing_features?: string | null
          full_name?: string | null
          gender?: string | null
          height?: string | null
          id?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"] | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_display_name: { Args: { user_uuid: string }; Returns: string }
    }
    Enums: {
      missing_status: "missing" | "found" | "closed"
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
    Enums: {
      missing_status: ["missing", "found", "closed"],
    },
  },
} as const
