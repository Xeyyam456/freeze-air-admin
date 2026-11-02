// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    body: string
    created_at: string
    id: number
    kind: string
    sent_at: string | null
    title: string
    url: string | null
    user_id: string
  }
  Insert: {
    body?: string
    created_at?: string
    id?: never
    kind: string
    sent_at?: string | null
    title: string
    url?: string | null
    user_id: string
  }
  Update: {
    body?: string
    created_at?: string
    id?: never
    kind?: string
    sent_at?: string | null
    title?: string
    url?: string | null
    user_id?: string
  }
  Relationships: []
}
