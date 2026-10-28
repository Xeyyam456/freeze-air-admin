// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    created_at: string
    id: number
    kind: string
    path: string
    work_log_id: number
  }
  Insert: {
    created_at?: string
    id?: never
    kind: string
    path: string
    work_log_id: number
  }
  Update: {
    created_at?: string
    id?: never
    kind?: string
    path?: string
    work_log_id?: number
  }
  Relationships: [
    {
      foreignKeyName: "work_files_work_log_id_fkey"
      columns: ["work_log_id"]
      isOneToOne: false
      referencedRelation: "work_logs"
      referencedColumns: ["id"]
    },
  ]
}
