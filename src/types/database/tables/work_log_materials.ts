// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
