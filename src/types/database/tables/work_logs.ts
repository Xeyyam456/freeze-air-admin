// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
