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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string | null
          clinic_id: string
          clinic_name: string
          created_at: string | null
          id: string
          notes: string | null
          referral_letter_url: string | null
          specialty: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_date?: string | null
          clinic_id: string
          clinic_name: string
          created_at?: string | null
          id?: string
          notes?: string | null
          referral_letter_url?: string | null
          specialty: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_date?: string | null
          clinic_id?: string
          clinic_name?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          referral_letter_url?: string | null
          specialty?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          id: number
          questions: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          questions?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          questions?: string | null
        }
        Relationships: []
      }
      user_symptoms: {
        Row: {
          "1stques": string | null
          "2ndques": string | null
          "3rdques": string | null
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          "1stques"?: string | null
          "2ndques"?: string | null
          "3rdques"?: string | null
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Update: {
          "1stques"?: string | null
          "2ndques"?: string | null
          "3rdques"?: string | null
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      medical_specialties: {
        Row: {
          id: string
          name: string
          description: string | null
          keywords: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          keywords?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          keywords?: string[] | null
          created_at?: string | null
        }
        Relationships: []
      }
      healthcare_facilities: {
        Row: {
          id: string
          name: string
          type: string
          address: string
          state: string
          city: string
          phone: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          address: string
          state: string
          city: string
          phone?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          address?: string
          state?: string
          city?: string
          phone?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          id: string
          name: string
          title: string
          specialty_id: string | null
          facility_id: string | null
          qualifications: string[] | null
          languages: string[] | null
          experience_years: number | null
          consultation_fee: number | null
          is_available: boolean | null
          profile_image_url: string | null
          bio: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          title?: string
          specialty_id?: string | null
          facility_id?: string | null
          qualifications?: string[] | null
          languages?: string[] | null
          experience_years?: number | null
          consultation_fee?: number | null
          is_available?: boolean | null
          profile_image_url?: string | null
          bio?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          title?: string
          specialty_id?: string | null
          facility_id?: string | null
          qualifications?: string[] | null
          languages?: string[] | null
          experience_years?: number | null
          consultation_fee?: number | null
          is_available?: boolean | null
          profile_image_url?: string | null
          bio?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "healthcare_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          }
        ]
      }
      doctor_schedules: {
        Row: {
          id: string
          doctor_id: string | null
          day_of_week: number
          start_time: string
          end_time: string
          slot_duration_minutes: number | null
          max_patients_per_slot: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          doctor_id?: string | null
          day_of_week: number
          start_time: string
          end_time: string
          slot_duration_minutes?: number | null
          max_patients_per_slot?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string | null
          day_of_week?: number
          start_time?: string
          end_time?: string
          slot_duration_minutes?: number | null
          max_patients_per_slot?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      available_appointments: {
        Row: {
          id: string
          doctor_id: string | null
          appointment_date: string
          start_time: string
          end_time: string
          is_booked: boolean | null
          booking_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          doctor_id?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          is_booked?: boolean | null
          booking_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          is_booked?: boolean | null
          booking_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "available_appointments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      referral_analyses: {
        Row: {
          id: string
          user_id: string | null
          referral_letter_url: string
          extracted_text: string | null
          suggested_specialty: string | null
          symptoms: string[] | null
          urgency_level: string | null
          keywords: string[] | null
          confidence_score: number | null
          ai_analysis_json: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          referral_letter_url: string
          extracted_text?: string | null
          suggested_specialty?: string | null
          symptoms?: string[] | null
          urgency_level?: string | null
          keywords?: string[] | null
          confidence_score?: number | null
          ai_analysis_json?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          referral_letter_url?: string
          extracted_text?: string | null
          suggested_specialty?: string | null
          symptoms?: string[] | null
          urgency_level?: string | null
          keywords?: string[] | null
          confidence_score?: number | null
          ai_analysis_json?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
