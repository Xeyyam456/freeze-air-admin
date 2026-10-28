// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    key: string
    updated_at: string
    value: string
  }
  Insert: {
    key: string
    updated_at?: string
    value?: string
  }
  Update: {
    key?: string
    updated_at?: string
    value?: string
  }
  Relationships: []
}
