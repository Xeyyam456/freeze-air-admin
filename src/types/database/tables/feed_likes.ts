// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    created_at: string
    employee_id: number
    grp: string
    kind: string
    work_log_id: number
  }
  Insert: {
    created_at?: string
    employee_id: number
    grp: string
    kind?: string
    work_log_id: number
  }
  Update: {
    created_at?: string
    employee_id?: number
    grp?: string
    kind?: string
    work_log_id?: number
  }
  Relationships: [
    {
      foreignKeyName: "feed_likes_work_log_id_fkey"
      columns: ["work_log_id"]
      isOneToOne: false
      referencedRelation: "work_logs"
      referencedColumns: ["id"]
    },
  ]
}
