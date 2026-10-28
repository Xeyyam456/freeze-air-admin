// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    created_at: string
    created_by: string | null
    id: number
    name: string | null
  }
  Insert: {
    created_at?: string
    created_by?: string | null
    id?: never
    name?: string | null
  }
  Update: {
    created_at?: string
    created_by?: string | null
    id?: never
    name?: string | null
  }
  Relationships: []
}
