// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    cause: string | null
    code: string
    created_at: string
    id: number
    model_id: number
    solution: string | null
    source: string | null
    title: string
  }
  Insert: {
    cause?: string | null
    code: string
    created_at?: string
    id?: never
    model_id: number
    solution?: string | null
    source?: string | null
    title: string
  }
  Update: {
    cause?: string | null
    code?: string
    created_at?: string
    id?: never
    model_id?: number
    solution?: string | null
    source?: string | null
    title?: string
  }
  Relationships: [
    {
      foreignKeyName: "ac_error_codes_model_id_fkey"
      columns: ["model_id"]
      isOneToOne: false
      referencedRelation: "ac_models"
      referencedColumns: ["id"]
    },
  ]
}
