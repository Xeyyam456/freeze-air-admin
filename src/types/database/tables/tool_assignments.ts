// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
