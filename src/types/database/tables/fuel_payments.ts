// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
