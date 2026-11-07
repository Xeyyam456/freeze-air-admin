// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    comment_id: number
    created_at: string
    employee_id: number
    kind: string
  }
  Insert: {
    comment_id: number
    created_at?: string
    employee_id: number
    kind: string
  }
  Update: {
    comment_id?: number
    created_at?: string
    employee_id?: number
    kind?: string
  }
  Relationships: [
    {
      foreignKeyName: "feed_comment_reactions_comment_id_fkey"
      columns: ["comment_id"]
      isOneToOne: false
      referencedRelation: "feed_comments"
      referencedColumns: ["id"]
    },
  ]
}
