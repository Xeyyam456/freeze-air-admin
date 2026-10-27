// Supabase-dən avtomatik yaradılıb (generate_typescript_types). Sxem dəyişəndə yenilə.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ac_brands: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      ac_error_codes: {
        Row: {
          cause: string | null
          code: string
          created_at: string
          id: number
          model_id: number
          solution: string | null
          source: string | null
          title: string
        }
        Insert: {
          cause?: string | null
          code: string
          created_at?: string
          id?: never
          model_id: number
          solution?: string | null
          source?: string | null
          title: string
        }
        Update: {
          cause?: string | null
          code?: string
          created_at?: string
          id?: never
          model_id?: number
          solution?: string | null
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ac_error_codes_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ac_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ac_models: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          checked_in_at: string
          checked_out_at: string | null
          day: string
          employee_id: number
          id: number
        }
        Insert: {
          checked_in_at?: string
          checked_out_at?: string | null
          day: string
          employee_id: number
          id?: never
        }
        Update: {
          checked_in_at?: string
          checked_out_at?: string | null
          day?: string
          employee_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_absences: {
        Row: {
          created_at: string
          created_by: string | null
          day: string
          employee_id: number
          id: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day: string
          employee_id: number
          id?: never
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day?: string
          employee_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "attendance_absences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          id: number
          kind: string
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          id?: never
          kind?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          id?: never
          kind?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string | null
          handled: boolean
          id: number
          message: string | null
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          handled?: boolean
          id?: never
          message?: string | null
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          email?: string | null
          handled?: boolean
          id?: never
          message?: string | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      crew_members: {
        Row: {
          crew_id: number
          employee_id: number
        }
        Insert: {
          crew_id: number
          employee_id: number
        }
        Update: {
          crew_id?: number
          employee_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: never
          name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: never
          name?: string | null
        }
        Relationships: []
      }
      depot_requests: {
        Row: {
          assignment_id: number | null
          batch: string | null
          created_at: string
          created_by: string
          created_by_name: string | null
          decided_at: string | null
          decided_by: string | null
          decided_by_name: string | null
          decision_note: string | null
          employee_id: number | null
          expected: number | null
          id: number
          note: string | null
          photo_path: string | null
          piece_id: number | null
          quantity: number | null
          reason: string | null
          returned: number | null
          status: string
          supplier: string | null
          tool_id: number | null
          tool_kind: string
          tool_name: string
          type: string
          unit: string
          used: number | null
        }
        Insert: {
          assignment_id?: number | null
          batch?: string | null
          created_at?: string
          created_by?: string
          created_by_name?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decided_by_name?: string | null
          decision_note?: string | null
          employee_id?: number | null
          expected?: number | null
          id?: never
          note?: string | null
          photo_path?: string | null
          piece_id?: number | null
          quantity?: number | null
          reason?: string | null
          returned?: number | null
          status?: string
          supplier?: string | null
          tool_id?: number | null
          tool_kind: string
          tool_name: string
          type: string
          unit: string
          used?: number | null
        }
        Update: {
          assignment_id?: number | null
          batch?: string | null
          created_at?: string
          created_by?: string
          created_by_name?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decided_by_name?: string | null
          decision_note?: string | null
          employee_id?: number | null
          expected?: number | null
          id?: never
          note?: string | null
          photo_path?: string | null
          piece_id?: number | null
          quantity?: number | null
          reason?: string | null
          returned?: number | null
          status?: string
          supplier?: string | null
          tool_id?: number | null
          tool_kind?: string
          tool_name?: string
          type?: string
          unit?: string
          used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "depot_requests_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "tool_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depot_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depot_requests_piece_id_fkey"
            columns: ["piece_id"]
            isOneToOne: false
            referencedRelation: "material_pieces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depot_requests_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depot_requests_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          car_model: string | null
          car_plate: string | null
          created_at: string
          fuel_per_100: number | null
          fuel_type: string | null
          full_name: string
          has_car: boolean
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
          worker_type: string
        }
        Insert: {
          car_model?: string | null
          car_plate?: string | null
          created_at?: string
          fuel_per_100?: number | null
          fuel_type?: string | null
          full_name: string
          has_car?: boolean
          id?: never
          is_active?: boolean
          is_management?: boolean
          is_storekeeper?: boolean
          phone?: string | null
          photo_url?: string | null
          position: string
          specialty?: string | null
          start_date?: string | null
          user_id?: string | null
          worker_type?: string
        }
        Update: {
          car_model?: string | null
          car_plate?: string | null
          created_at?: string
          fuel_per_100?: number | null
          fuel_type?: string | null
          full_name?: string
          has_car?: boolean
          id?: never
          is_active?: boolean
          is_management?: boolean
          is_storekeeper?: boolean
          phone?: string | null
          photo_url?: string | null
          position?: string
          specialty?: string | null
          start_date?: string | null
          user_id?: string | null
          worker_type?: string
        }
        Relationships: []
      }
      fuel_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          day: string
          employee_id: number
          id: number
          note: string | null
          status: string
          status_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          day?: string
          employee_id: number
          id?: never
          note?: string | null
          status?: string
          status_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          day?: string
          employee_id?: number
          id?: never
          note?: string | null
          status?: string
          status_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_settings: {
        Row: {
          diesel_price: number | null
          id: number
          petrol_price: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          diesel_price?: number | null
          id?: number
          petrol_price?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          diesel_price?: number | null
          id?: number
          petrol_price?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          created_at: string
          date_from: string
          date_to: string
          decided_at: string | null
          decided_by: string | null
          employee_id: number
          id: number
          reason: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date_from: string
          date_to: string
          decided_at?: string | null
          decided_by?: string | null
          employee_id: number
          id?: never
          reason?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          date_from?: string
          date_to?: string
          decided_at?: string | null
          decided_by?: string | null
          employee_id?: number
          id?: never
          reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      material_pieces: {
        Row: {
          created_at: string
          from_employee_id: number | null
          id: number
          length: number
          original_length: number | null
          tool_id: number
        }
        Insert: {
          created_at?: string
          from_employee_id?: number | null
          id?: never
          length: number
          original_length?: number | null
          tool_id: number
        }
        Update: {
          created_at?: string
          from_employee_id?: number | null
          id?: never
          length?: number
          original_length?: number | null
          tool_id?: number
        }
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
            referencedRelation: "tool_stock"
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
      mileage_logs: {
        Row: {
          cost: number | null
          created_at: string
          day: string
          employee_id: number
          end_at: string | null
          end_km: number | null
          end_photo: string | null
          fuel_per_100: number | null
          fuel_price: number | null
          fuel_type: string | null
          id: number
          km: number | null
          liters: number | null
          start_at: string
          start_km: number
          start_photo: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          day?: string
          employee_id: number
          end_at?: string | null
          end_km?: number | null
          end_photo?: string | null
          fuel_per_100?: number | null
          fuel_price?: number | null
          fuel_type?: string | null
          id?: never
          km?: number | null
          liters?: number | null
          start_at?: string
          start_km: number
          start_photo?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          day?: string
          employee_id?: number
          end_at?: string | null
          end_km?: number | null
          end_photo?: string | null
          fuel_per_100?: number | null
          fuel_price?: number | null
          fuel_type?: string | null
          id?: never
          km?: number | null
          liters?: number | null
          start_at?: string
          start_km?: number
          start_photo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mileage_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      place_location_log: {
        Row: {
          id: number
          place_kind: string
          place_id: number
          employee_id: number | null
          old_lat: number | null
          old_lng: number | null
          old_address: string | null
          new_lat: number | null
          new_lng: number | null
          new_address: string | null
          accuracy_m: number | null
          created_at: string
        }
        Insert: {
          id?: number
          place_kind?: string
          place_id?: number
          employee_id?: number | null
          old_lat?: number | null
          old_lng?: number | null
          old_address?: string | null
          new_lat?: number | null
          new_lng?: number | null
          new_address?: string | null
          accuracy_m?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          place_kind?: string
          place_id?: number
          employee_id?: number | null
          old_lat?: number | null
          old_lng?: number | null
          old_address?: string | null
          new_lat?: number | null
          new_lng?: number | null
          new_address?: string | null
          accuracy_m?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_location_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_owner: boolean
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_owner?: boolean
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_owner?: boolean
          role?: string
        }
        Relationships: []
      }
      site_equipment: {
        Row: {
          id: number
          image_url: string | null
          is_active: boolean
          key: string
          place: string
          sort: number
          text: string
          title: string
        }
        Insert: {
          id?: never
          image_url?: string | null
          is_active?: boolean
          key: string
          place?: string
          sort?: number
          text?: string
          title: string
        }
        Update: {
          id?: never
          image_url?: string | null
          is_active?: boolean
          key?: string
          place?: string
          sort?: number
          text?: string
          title?: string
        }
        Relationships: []
      }
      site_faq: {
        Row: {
          answer: string
          id: number
          is_active: boolean
          question: string
          sort: number
        }
        Insert: {
          answer: string
          id?: never
          is_active?: boolean
          question: string
          sort?: number
        }
        Update: {
          answer?: string
          id?: never
          is_active?: boolean
          question?: string
          sort?: number
        }
        Relationships: []
      }
      site_segments: {
        Row: {
          equipment: string[]
          id: number
          image_position: string
          image_url: string | null
          is_active: boolean
          issues: string[]
          lead: string
          note: string
          slug: string
          sort: number
          summary: string
          title: string
          updated_at: string
          work: string[]
        }
        Insert: {
          equipment?: string[]
          id?: never
          image_position?: string
          image_url?: string | null
          is_active?: boolean
          issues?: string[]
          lead?: string
          note?: string
          slug: string
          sort?: number
          summary?: string
          title: string
          updated_at?: string
          work?: string[]
        }
        Update: {
          equipment?: string[]
          id?: never
          image_position?: string
          image_url?: string | null
          is_active?: boolean
          issues?: string[]
          lead?: string
          note?: string
          slug?: string
          sort?: number
          summary?: string
          title?: string
          updated_at?: string
          work?: string[]
        }
        Relationships: []
      }
      site_services: {
        Row: {
          details: string
          icon: string
          id: number
          image_url: string | null
          includes: string[]
          is_active: boolean
          lead: string
          note: string
          slug: string
          sort: number
          steps: string[]
          text: string
          title: string
        }
        Insert: {
          details?: string
          icon?: string
          id?: never
          image_url?: string | null
          includes?: string[]
          is_active?: boolean
          lead?: string
          note?: string
          slug: string
          sort?: number
          steps?: string[]
          text?: string
          title: string
        }
        Update: {
          details?: string
          icon?: string
          id?: never
          image_url?: string | null
          includes?: string[]
          is_active?: boolean
          lead?: string
          note?: string
          slug?: string
          sort?: number
          steps?: string[]
          text?: string
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_card_color: string
          about_card_text: string | null
          about_card_title: string | null
          about_image_main_url: string | null
          about_image_side_url: string | null
          about_points: string | null
          about_text: string | null
          about_title: string | null
          address: string | null
          email: string | null
          facebook_url: string | null
          hero_form_enabled: boolean
          hero_image_url: string | null
          hours: string | null
          id: number
          instagram_url: string | null
          logo_url: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          about_card_color?: string
          about_card_text?: string | null
          about_card_title?: string | null
          about_image_main_url?: string | null
          about_image_side_url?: string | null
          about_points?: string | null
          about_text?: string | null
          about_title?: string | null
          address?: string | null
          email?: string | null
          facebook_url?: string | null
          hero_form_enabled?: boolean
          hero_image_url?: string | null
          hours?: string | null
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          about_card_color?: string
          about_card_text?: string | null
          about_card_title?: string | null
          about_image_main_url?: string | null
          about_image_side_url?: string | null
          about_points?: string | null
          about_text?: string | null
          about_title?: string | null
          address?: string | null
          email?: string | null
          facebook_url?: string | null
          hero_form_enabled?: boolean
          hero_image_url?: string | null
          hours?: string | null
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          id: number
          is_active: boolean
          label: string
          sort: number
          value: string
        }
        Insert: {
          id?: never
          is_active?: boolean
          label: string
          sort?: number
          value: string
        }
        Update: {
          id?: never
          is_active?: boolean
          label?: string
          sort?: number
          value?: string
        }
        Relationships: []
      }
      site_texts: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          actor: string | null
          actor_name: string | null
          approved_by: string | null
          approved_name: string | null
          at: string
          employee_id: number | null
          id: number
          kind: string
          note: string | null
          quantity: number
          request_id: number | null
          tool_id: number | null
          tool_kind: string
          tool_name: string
          unit: string
        }
        Insert: {
          actor?: string | null
          actor_name?: string | null
          approved_by?: string | null
          approved_name?: string | null
          at?: string
          employee_id?: number | null
          id?: never
          kind: string
          note?: string | null
          quantity: number
          request_id?: number | null
          tool_id?: number | null
          tool_kind: string
          tool_name: string
          unit: string
        }
        Update: {
          actor?: string | null
          actor_name?: string | null
          approved_by?: string | null
          approved_name?: string | null
          at?: string
          employee_id?: number | null
          id?: never
          kind?: string
          note?: string | null
          quantity?: number
          request_id?: number | null
          tool_id?: number | null
          tool_kind?: string
          tool_name?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "depot_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
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
      tasks: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          company_id: number | null
          created_at: string
          created_by: string | null
          done: boolean
          done_at: string | null
          employee_id: number
          group_id: string | null
          id: number
          note: string | null
          place_text: string | null
          reason: string
          reassigned_to: number | null
          store_id: number | null
          task_date: string
          work_log_id: number | null
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_id?: number | null
          created_at?: string
          created_by?: string | null
          done?: boolean
          done_at?: string | null
          employee_id: number
          group_id?: string | null
          id?: never
          note?: string | null
          place_text?: string | null
          reason: string
          reassigned_to?: number | null
          store_id?: number | null
          task_date?: string
          work_log_id?: number | null
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_id?: number | null
          created_at?: string
          created_by?: string | null
          done?: boolean
          done_at?: string | null
          employee_id?: number
          group_id?: string | null
          id?: never
          note?: string | null
          place_text?: string | null
          reason?: string
          reassigned_to?: number | null
          store_id?: number | null
          task_date?: string
          work_log_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_reassigned_to_fkey"
            columns: ["reassigned_to"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_work_log_id_fkey"
            columns: ["work_log_id"]
            isOneToOne: false
            referencedRelation: "work_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_assignments: {
        Row: {
          disputed_at: string | null
          employee_id: number
          id: number
          note: string | null
          quantity: number
          received_at: string | null
          returned_at: string | null
          taken_at: string
          tool_id: number
          used: number
        }
        Insert: {
          disputed_at?: string | null
          employee_id: number
          id?: never
          note?: string | null
          quantity?: number
          received_at?: string | null
          returned_at?: string | null
          taken_at?: string
          tool_id: number
          used?: number
        }
        Update: {
          disputed_at?: string | null
          employee_id?: number
          id?: never
          note?: string | null
          quantity?: number
          received_at?: string | null
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
            referencedRelation: "tool_stock"
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
      tool_repairs: {
        Row: {
          id: number
          note: string | null
          outcome: string | null
          place: string | null
          quantity: number
          returned_at: string | null
          sent_at: string
          sent_by_name: string | null
          tool_id: number
        }
        Insert: {
          id?: never
          note?: string | null
          outcome?: string | null
          place?: string | null
          quantity: number
          returned_at?: string | null
          sent_at?: string
          sent_by_name?: string | null
          tool_id: number
        }
        Update: {
          id?: never
          note?: string | null
          outcome?: string | null
          place?: string | null
          quantity?: number
          returned_at?: string | null
          sent_at?: string
          sent_by_name?: string | null
          tool_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tool_repairs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_repairs_tool_id_fkey"
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
          min_stock: number | null
          name: string
          notes: string | null
          pack_name: string | null
          pack_size: number | null
          quantity: number
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: never
          inventory_code?: string | null
          kind?: string
          min_stock?: number | null
          name: string
          notes?: string | null
          pack_name?: string | null
          pack_size?: number | null
          quantity?: number
          unit?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: never
          inventory_code?: string | null
          kind?: string
          min_stock?: number | null
          name?: string
          notes?: string | null
          pack_name?: string | null
          pack_size?: number | null
          quantity?: number
          unit?: string
        }
        Relationships: []
      }
      work_files: {
        Row: {
          created_at: string
          id: number
          kind: string
          path: string
          work_log_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          kind: string
          path: string
          work_log_id: number
        }
        Update: {
          created_at?: string
          id?: never
          kind?: string
          path?: string
          work_log_id?: number
        }
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
      work_log_materials: {
        Row: {
          amount: number
          id: number
          tool_id: number
          work_log_id: number
        }
        Insert: {
          amount: number
          id?: never
          tool_id: number
          work_log_id: number
        }
        Update: {
          amount?: number
          id?: never
          tool_id?: number
          work_log_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "work_log_materials_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_log_materials_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_log_materials_work_log_id_fkey"
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
          id: number
          place_text: string | null
          store_id: number | null
          work_date: string
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          employee_id: number
          id?: never
          place_text?: string | null
          store_id?: number | null
          work_date?: string
        }
        Update: {
          company_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          employee_id?: number
          id?: never
          place_text?: string | null
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
      // Anbar vəziyyəti: ümumi say, ustalarda, təmirdə, depoda qalan (view-da sütunlar null olmur, tiplər əl ilə dəqiqləşdirilib)
      tool_stock: {
        Row: {
          available: number
          category: string | null
          created_at: string
          given_out: number
          id: number
          in_repair: number
          inventory_code: string | null
          kind: string
          min_stock: number | null
          name: string
          notes: string | null
          pack_name: string | null
          pack_size: number | null
          pieces_count: number
          pieces_total: number
          quantity: number
          unit: string
        }
        Relationships: []
      }
    }
    Functions: {
      assignment_confirm: {
        Args: { p_id: number; p_received: boolean }
        Returns: undefined
      }
      baku_today: { Args: never; Returns: string }
      can_manage_tools: { Args: never; Returns: boolean }
      check_in: { Args: never; Returns: string }
      check_out: { Args: never; Returns: string }
      depot_actor_name: { Args: { p_uid: string }; Returns: string }
      depot_cancel_returns: {
        Args: { p_assignment_id: number }
        Returns: undefined
      }
      depot_check: { Args: never; Returns: undefined }
      depot_count_create: {
        Args: { p_items: Json; p_note?: string }
        Returns: number
      }
      depot_decide: {
        Args: {
          p_approve: boolean
          p_id: number
          p_note?: string
          p_quantity?: number
          p_returned?: number
          p_used?: number
        }
        Returns: undefined
      }
      depot_internal: { Args: never; Returns: boolean }
      depot_log: {
        Args: {
          p_employee?: number
          p_kind: string
          p_note?: string
          p_qty: number
          p_tool_id: number
        }
        Returns: undefined
      }
      depot_new_request: {
        Args: { p_tool_id: number; p_type: string }
        Returns: {
          assignment_id: number | null
          created_at: string
          created_by: string
          created_by_name: string | null
          decided_at: string | null
          decided_by: string | null
          decided_by_name: string | null
          decision_note: string | null
          employee_id: number | null
          expected: number | null
          id: number
          note: string | null
          photo_path: string | null
          piece_id: number | null
          quantity: number | null
          reason: string | null
          returned: number | null
          status: string
          supplier: string | null
          tool_id: number | null
          tool_kind: string
          tool_name: string
          type: string
          unit: string
          used: number | null
        }
        SetofOptions: {
          from: "*"
          to: "depot_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      depot_receipt_create: {
        Args: {
          p_note?: string
          p_photo?: string
          p_quantity: number
          p_supplier?: string
          p_tool_id: number
        }
        Returns: number
      }
      depot_request_cancel: { Args: { p_id: number }; Returns: undefined }
      depot_request_create: {
        Args: { p_batch?: string; p_note?: string; p_quantity: number; p_tool_id: number }
        Returns: number
      }
      depot_return_create: {
        Args: {
          p_assignment_id: number
          p_note?: string
          p_quantity?: number
          p_returned?: number
          p_used?: number
        }
        Returns: number
      }
      depot_writeoff_create: {
        Args: {
          p_assignment_id?: number
          p_note?: string
          p_photo?: string
          p_piece_id?: number
          p_quantity: number
          p_reason: string
          p_tool_id: number
        }
        Returns: number
      }
      fuel_payment_confirm: {
        Args: { p_id: number; p_received: boolean }
        Returns: undefined
      }
      fuel_price_for: { Args: { p_type: string }; Returns: number }
      give_piece: {
        Args: { p_amount?: number; p_employee_id: number; p_piece_id: number }
        Returns: undefined
      }
      give_tool: {
        Args: { p_employee_id: number; p_quantity: number; p_tool_id: number }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_owner: { Args: never; Returns: boolean }
      is_storekeeper: { Args: never; Returns: boolean }
      leave_cancel: { Args: { p_id: number }; Returns: undefined }
      place_set_location: {
        Args: { p_accuracy?: number; p_address?: string; p_id: number; p_kind: string; p_lat?: number; p_lng?: number }
        Returns: undefined
      }
      leave_decide: {
        Args: { p_approve: boolean; p_id: number }
        Returns: undefined
      }
      material_small_to_pieces: {
        Args: { p_tool_id: number }
        Returns: undefined
      }
      mileage_fill_missing: { Args: never; Returns: number }
      my_employee_id: { Args: never; Returns: number }
      public_employees: {
        Args: never
        Returns: {
          full_name: string
          id: number
          photo_url: string
          specialty: string
          start_date: string
          worker_type: string
        }[]
      }
      public_management: {
        Args: never
        Returns: {
          full_name: string
          id: number
          job_title: string
          photo_url: string
        }[]
      }
      return_tool: {
        Args: { p_assignment_id: number; p_quantity: number }
        Returns: undefined
      }
      set_employee_photo: {
        Args: { p_employee_id: number; p_url: string | null }
        Returns: undefined
      }
      settle_material: {
        Args: { p_assignment_id: number; p_returned: number; p_used: number }
        Returns: undefined
      }
      task_add_member: {
        Args: { p_employee_id: number; p_task_id: number }
        Returns: number
      }
      task_ensure_log: {
        Args: { t: Database["public"]["Tables"]["tasks"]["Row"] }
        Returns: number
      }
      task_set_done: {
        Args: { p_done: boolean; p_task_id: number }
        Returns: undefined
      }
      task_set_note: {
        Args: { p_note: string; p_task_id: number }
        Returns: number
      }
      task_withdraw: {
        Args: { p_new_employee_id?: number; p_task_id: number }
        Returns: number
      }
      tool_repair_finish: {
        Args: { p_fixed: boolean; p_id: number }
        Returns: undefined
      }
      tool_repair_send: {
        Args: {
          p_note?: string
          p_place?: string
          p_quantity: number
          p_tool_id: number
        }
        Returns: undefined
      }
      work_file_counts: {
        Args: { p_log_ids: number[] }
        Returns: {
          act: number
          photo: number
          video: number
          work_log_id: number
        }[]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
