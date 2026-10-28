// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    created_at: string
    full_name: string | null
    id: string
    is_owner: boolean
    role: string
  }
  Insert: {
    created_at?: string
    full_name?: string | null
    id: string
    is_owner?: boolean
    role?: string
  }
  Update: {
    created_at?: string
    full_name?: string | null
    id?: string
    is_owner?: boolean
    role?: string
  }
  Relationships: []
}
