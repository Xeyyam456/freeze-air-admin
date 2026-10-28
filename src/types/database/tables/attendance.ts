// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
