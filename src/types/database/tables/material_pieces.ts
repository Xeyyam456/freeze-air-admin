// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
