// Supabase-dən avtomatik yaradılıb (generate_typescript_types). Sxem dəyişəndə yenilə.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ac_brands: {
        Row: { id: number; name: string }
        Insert: { id?: never; name: string }
        Update: { id?: never; name?: string }
        Relationships: []
      }
      ac_error_codes: {
        Row: {
          brand_id: number
          cause: string | null
          code: string
          created_at: string
          id: number
          model_series: string | null
          solution: string | null
          source: string | null
          title: string
        }
        Insert: {
          brand_id: number
          cause?: string | null
          code: string
          created_at?: string
          id?: never
          model_series?: string | null
          solution?: string | null
          source?: string | null
          title: string
        }
        Update: {
          brand_id?: number
          cause?: string | null
          code?: string
          created_at?: string
          id?: never
          model_series?: string | null
          solution?: string | null
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ac_error_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "ac_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          contact_person: string | null
          address: string | null
          lat: number | null
          lng: number | null
          kind: string
          created_at: string
          id: number
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          contact_person?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          kind?: string
          created_at?: string
          id?: never
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          contact_person?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          kind?: string
          created_at?: string
          id?: never
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          full_name: string
          id: number
          is_active: boolean
          is_management: boolean
          is_storekeeper: boolean
          phone: string | null
          photo_url: string | null
          position: string
          specialty: string | null
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: never
          is_active?: boolean
          is_management?: boolean
          phone?: string | null
          photo_url?: string | null
          position: string
          is_storekeeper?: boolean
          specialty?: string | null
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: never
          is_active?: boolean
          is_management?: boolean
          phone?: string | null
          photo_url?: string | null
          position?: string
          is_storekeeper?: boolean
          specialty?: string | null
          start_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string; is_owner: boolean; role: string }
        Insert: { created_at?: string; full_name?: string | null; id: string; is_owner?: boolean; role?: string }
        Update: { created_at?: string; full_name?: string | null; id?: string; is_owner?: boolean; role?: string }
        Relationships: []
      }
      contact_requests: {
        Row: { created_at: string; email: string | null; handled: boolean; id: number; message: string | null; name: string; phone: string }
        Insert: { created_at?: string; email?: string | null; handled?: boolean; id?: number; message?: string | null; name: string; phone: string }
        Update: { created_at?: string; email?: string | null; handled?: boolean; id?: number; message?: string | null; name?: string; phone?: string }
        Relationships: []
      }
      site_equipment: {
        Row: { id: number; image_url: string | null; is_active: boolean; key: string; place: string; sort: number; text: string; title: string }
        Insert: { id?: number; image_url?: string | null; is_active?: boolean; key: string; place?: string; sort?: number; text?: string; title: string }
        Update: { id?: number; image_url?: string | null; is_active?: boolean; key?: string; place?: string; sort?: number; text?: string; title?: string }
        Relationships: []
      }
      site_segments: {
        Row: { equipment: string[]; id: number; image_position: string; image_url: string | null; is_active: boolean; issues: string[]; lead: string; note: string; slug: string; sort: number; summary: string; title: string; updated_at: string; work: string[] }
        Insert: { equipment?: string[]; id?: number; image_position?: string; image_url?: string | null; is_active?: boolean; issues?: string[]; lead?: string; note?: string; slug: string; sort?: number; summary?: string; title: string; updated_at?: string; work?: string[] }
        Update: { equipment?: string[]; id?: number; image_position?: string; image_url?: string | null; is_active?: boolean; issues?: string[]; lead?: string; note?: string; slug?: string; sort?: number; summary?: string; title?: string; updated_at?: string; work?: string[] }
        Relationships: []
      }
      site_services: {
        Row: { details: string; icon: string; id: number; image_url: string | null; includes: string[]; is_active: boolean; lead: string; note: string; slug: string; sort: number; steps: string[]; text: string; title: string }
        Insert: { details?: string; icon?: string; id?: number; image_url?: string | null; includes?: string[]; is_active?: boolean; lead?: string; note?: string; slug: string; sort?: number; steps?: string[]; text?: string; title: string }
        Update: { details?: string; icon?: string; id?: number; image_url?: string | null; includes?: string[]; is_active?: boolean; lead?: string; note?: string; slug?: string; sort?: number; steps?: string[]; text?: string; title?: string }
        Relationships: []
      }
      site_settings: {
        Row: { about_card_color: string; about_card_text: string | null; about_card_title: string | null; about_image_main_url: string | null; about_image_side_url: string | null; about_points: string | null; about_text: string | null; about_title: string | null; address: string | null; email: string | null; hero_image_url: string | null; hours: string | null; id: number; logo_url: string | null; phone: string | null; updated_at: string }
        Insert: { about_card_color?: string; about_card_text?: string | null; about_card_title?: string | null; about_image_main_url?: string | null; about_image_side_url?: string | null; about_points?: string | null; about_text?: string | null; about_title?: string | null; address?: string | null; email?: string | null; hero_image_url?: string | null; hours?: string | null; id?: number; logo_url?: string | null; phone?: string | null; updated_at?: string }
        Update: { about_card_color?: string; about_card_text?: string | null; about_card_title?: string | null; about_image_main_url?: string | null; about_image_side_url?: string | null; about_points?: string | null; about_text?: string | null; about_title?: string | null; address?: string | null; email?: string | null; hero_image_url?: string | null; hours?: string | null; id?: number; logo_url?: string | null; phone?: string | null; updated_at?: string }
        Relationships: []
      }
      site_texts: {
        Row: { key: string; updated_at: string; value: string }
        Insert: { key: string; updated_at?: string; value?: string }
        Update: { key?: string; updated_at?: string; value?: string }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          code: string
          company_id: number
          created_at: string
          id: number
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          code: string
          company_id: number
          created_at?: string
          id?: never
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          company_id?: number
          created_at?: string
          id?: never
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_assignments: {
        Row: {
          employee_id: number
          id: number
          note: string | null
          quantity: number
          returned_at: string | null
          taken_at: string
          tool_id: number
          used: number
        }
        Insert: {
          employee_id: number
          id?: never
          note?: string | null
          quantity?: number
          returned_at?: string | null
          taken_at?: string
          tool_id: number
          used?: number
        }
        Update: {
          employee_id?: number
          id?: never
          note?: string | null
          quantity?: number
          returned_at?: string | null
          taken_at?: string
          tool_id?: number
          used?: number
        }
        Relationships: [
          {
            foreignKeyName: "tool_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_assignments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      material_pieces: {
        Row: { created_at: string; from_employee_id: number | null; id: number; length: number; tool_id: number }
        Insert: { created_at?: string; from_employee_id?: number | null; id?: never; length: number; tool_id: number }
        Update: { created_at?: string; from_employee_id?: number | null; id?: never; length?: number; tool_id?: number }
        Relationships: [
          {
            foreignKeyName: "material_pieces_from_employee_id_fkey"
            columns: ["from_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_pieces_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category: string | null
          created_at: string
          id: number
          inventory_code: string | null
          kind: string
          name: string
          notes: string | null
          quantity: number
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: never
          inventory_code?: string | null
          kind?: string
          name: string
          notes?: string | null
          quantity?: number
          unit?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: never
          inventory_code?: string | null
          kind?: string
          name?: string
          notes?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: []
      }
      work_files: {
        Row: { created_at: string; id: number; kind: string; path: string; work_log_id: number }
        Insert: { created_at?: string; id?: never; kind: string; path: string; work_log_id: number }
        Update: { created_at?: string; id?: never; kind?: string; path?: string; work_log_id?: number }
        Relationships: [
          {
            foreignKeyName: "work_files_work_log_id_fkey"
            columns: ["work_log_id"]
            isOneToOne: false
            referencedRelation: "work_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      work_logs: {
        Row: {
          company_id: number | null
          created_at: string
          created_by: string | null
          description: string
          employee_id: number
          place_text: string | null
          id: number
          store_id: number | null
          work_date: string
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          employee_id: number
          place_text?: string | null
          id?: never
          store_id?: number | null
          work_date?: string
        }
        Update: {
          company_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          employee_id?: number
          place_text?: string | null
          id?: never
          store_id?: number | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      // Anbar vəziyyəti: ümumi say, ustalarda, depoda qalan (view-da sütunlar null olmur, tiplər əl ilə dəqiqləşdirilib)
      tool_stock: {
        Row: {
          available: number
          category: string | null
          created_at: string
          given_out: number
          id: number
          inventory_code: string | null
          kind: string
          name: string
          notes: string | null
          pieces_count: number
          pieces_total: number
          quantity: number
          unit: string
        }
        Relationships: []
      }
    }
    Functions: {
      can_manage_tools: { Args: never; Returns: boolean }
      finish_material: { Args: { p_assignment_id: number; p_used: number }; Returns: undefined }
      give_piece: { Args: { p_amount?: number; p_employee_id: number; p_piece_id: number }; Returns: undefined }
      give_tool: { Args: { p_employee_id: number; p_quantity: number; p_tool_id: number }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      is_storekeeper: { Args: never; Returns: boolean }
      my_employee_id: { Args: never; Returns: number }
      return_tool: { Args: { p_assignment_id: number; p_quantity: number }; Returns: undefined }
      set_employee_photo: { Args: { p_employee_id: number; p_url: string | null }; Returns: undefined }
      public_employees: {
        Args: never
        Returns: { full_name: string; id: number; photo_url: string | null; specialty: string | null; start_date: string | null }[]
      }
      public_management: {
        Args: never
        Returns: { full_name: string; id: number; job_title: string; photo_url: string | null }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])> =
  (PublicSchema["Tables"] & PublicSchema["Views"])[T] extends { Row: infer R } ? R : never
