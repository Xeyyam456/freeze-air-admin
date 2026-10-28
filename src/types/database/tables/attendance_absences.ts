// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
