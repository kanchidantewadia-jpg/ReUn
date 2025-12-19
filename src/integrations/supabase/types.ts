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
          face_match_confidence: number | null
          footage_url: string
          id: string
          location: string | null
          matched_person_id: string | null
          missing_person_id: string
          recorded_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          face_match_confidence?: number | null
          footage_url: string
          id?: string
          location?: string | null
          matched_person_id?: string | null
          missing_person_id: string
          recorded_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          face_match_confidence?: number | null
          footage_url?: string
          id?: string
          location?: string | null
          matched_person_id?: string | null
          missing_person_id?: string
          recorded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "cctv_footage_matched_person_id_fkey"
            columns: ["matched_person_id"]
            isOneToOne: false
            referencedRelation: "authenticated_missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cctv_footage_matched_person_id_fkey"
            columns: ["matched_person_id"]
            isOneToOne: false
            referencedRelation: "missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cctv_footage_matched_person_id_fkey"
            columns: ["matched_person_id"]
            isOneToOne: false
            referencedRelation: "public_missing_persons"
            referencedColumns: ["id"]
          },
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
      community_sightings: {
        Row: {
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          missing_person_id: string
          reporter_name: string | null
          reporter_phone: string | null
          sighting_date: string | null
          sighting_description: string | null
          sighting_location: string
          sighting_photo_url: string | null
          source: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          missing_person_id: string
          reporter_name?: string | null
          reporter_phone?: string | null
          sighting_date?: string | null
          sighting_description?: string | null
          sighting_location: string
          sighting_photo_url?: string | null
          source?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          missing_person_id?: string
          reporter_name?: string | null
          reporter_phone?: string | null
          sighting_date?: string | null
          sighting_description?: string | null
          sighting_location?: string
          sighting_photo_url?: string | null
          source?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "community_sightings_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "authenticated_missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_sightings_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_sightings_missing_person_id_fkey"
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
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          full_name: string
          gender: string | null
          height: string | null
          id: string
          is_minor: boolean | null
          is_resolved: boolean | null
          last_seen_date: string
          last_seen_location: string
          latitude: number | null
          longitude: number | null
          photo_url: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["missing_status"]
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
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
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name: string
          gender?: string | null
          height?: string | null
          id?: string
          is_minor?: boolean | null
          is_resolved?: boolean | null
          last_seen_date: string
          last_seen_location: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["missing_status"]
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name?: string
          gender?: string | null
          height?: string | null
          id?: string
          is_minor?: boolean | null
          is_resolved?: boolean | null
          last_seen_date?: string
          last_seen_location?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["missing_status"]
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message_id: string
          message_preview: string
          missing_person_id: string
          sender_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_id: string
          message_preview: string
          missing_person_id: string
          sender_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_id?: string
          message_preview?: string
          missing_person_id?: string
          sender_name?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code: string
          consumed: boolean
          created_at: string
          email: string
          expires_at: string
          id: string
          purpose: string
        }
        Insert: {
          attempts?: number
          code: string
          consumed?: boolean
          created_at?: string
          email: string
          expires_at: string
          id?: string
          purpose?: string
        }
        Update: {
          attempts?: number
          code?: string
          consumed?: boolean
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          purpose?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email_notifications: boolean | null
          full_name: string
          id: string
          phone_number: string | null
          privacy_settings: Json | null
          show_real_name: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email_notifications?: boolean | null
          full_name: string
          id?: string
          phone_number?: string | null
          privacy_settings?: Json | null
          show_real_name?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email_notifications?: boolean | null
          full_name?: string
          id?: string
          phone_number?: string | null
          privacy_settings?: Json | null
          show_real_name?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
          latitude: number | null
          longitude: number | null
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
          latitude?: number | null
          longitude?: number | null
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
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["missing_status"] | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      public_community_sightings: {
        Row: {
          created_at: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          missing_person_id: string | null
          sighting_date: string | null
          sighting_description: string | null
          sighting_location: string | null
          sighting_photo_url: string | null
          source: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          missing_person_id?: string | null
          sighting_date?: string | null
          sighting_description?: string | null
          sighting_location?: string | null
          sighting_photo_url?: string | null
          source?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          longitude?: number | null
          missing_person_id?: string | null
          sighting_date?: string | null
          sighting_description?: string | null
          sighting_location?: string | null
          sighting_photo_url?: string | null
          source?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "community_sightings_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "authenticated_missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_sightings_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "missing_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_sightings_missing_person_id_fkey"
            columns: ["missing_person_id"]
            isOneToOne: false
            referencedRelation: "public_missing_persons"
            referencedColumns: ["id"]
          },
        ]
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
      can_view_contact_info: {
        Args: { _report_id: string; _user_id: string }
        Returns: boolean
      }
      get_display_name: { Args: { user_uuid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_missing_persons: {
        Args: {
          date_from?: string
          date_to?: string
          max_age?: number
          min_age?: number
          search_text?: string
          status_filter?: string
        }
        Returns: {
          additional_info: string
          age: number
          clothing_description: string
          created_at: string
          distinguishing_features: string
          full_name: string
          gender: string
          height: string
          id: string
          last_seen_date: string
          last_seen_location: string
          photo_url: string
          relevance: number
          status: Database["public"]["Enums"]["missing_status"]
          updated_at: string
          weight: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
      missing_status: ["missing", "found", "closed"],
    },
  },
} as const
