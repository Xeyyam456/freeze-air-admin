// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    created_at: string
    email: string | null
    handled: boolean
    id: number
    message: string | null
    name: string
    phone: string
  }
  Insert: {
    created_at?: string
    email?: string | null
    handled?: boolean
    id?: never
    message?: string | null
    name: string
    phone: string
  }
  Update: {
    created_at?: string
    email?: string | null
    handled?: boolean
    id?: never
    message?: string | null
    name?: string
    phone?: string
  }
  Relationships: []
}
