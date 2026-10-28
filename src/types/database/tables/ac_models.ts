// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    created_at: string
    id: number
    name: string
  }
  Insert: {
    created_at?: string
    id?: never
    name: string
  }
  Update: {
    created_at?: string
    id?: never
    name?: string
  }
  Relationships: []
}
