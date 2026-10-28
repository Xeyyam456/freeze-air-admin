// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
