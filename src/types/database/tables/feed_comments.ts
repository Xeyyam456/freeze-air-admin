// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    body: string
    audio_ms: number | null
    audio_path: string | null
    audio_peaks: number[] | null
    created_at: string
    employee_id: number
    grp: string
    id: number
    work_log_id: number
  }
  Insert: {
    body: string
    audio_ms?: number | null
    audio_path?: string | null
    audio_peaks?: number[] | null
    created_at?: string
    employee_id: number
    grp: string
    id?: never
    work_log_id: number
  }
  Update: {
    body?: string
    audio_ms?: number | null
    audio_path?: string | null
    audio_peaks?: number[] | null
    created_at?: string
    employee_id?: number
    grp?: string
    id?: never
    work_log_id?: number
  }
  Relationships: [
    {
      foreignKeyName: "feed_comments_work_log_id_fkey"
      columns: ["work_log_id"]
      isOneToOne: false
      referencedRelation: "work_logs"
      referencedColumns: ["id"]
    },
  ]
}
