// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
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
