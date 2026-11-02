// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    body: string
    created_at: string
    created_by: string | null
    created_by_name: string | null
    id: number
    title: string
  }
  Insert: {
    body?: string
    created_at?: string
    created_by?: string | null
    created_by_name?: string | null
    id?: never
    title: string
  }
  Update: {
    body?: string
    created_at?: string
    created_by?: string | null
    created_by_name?: string | null
    id?: never
    title?: string
  }
  Relationships: []
}
