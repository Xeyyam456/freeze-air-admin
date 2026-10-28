// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
