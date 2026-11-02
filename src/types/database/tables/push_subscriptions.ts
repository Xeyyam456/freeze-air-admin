// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    app: string
    auth: string
    created_at: string
    endpoint: string
    id: number
    p256dh: string
    user_agent: string | null
    user_id: string
  }
  Insert: {
    app: string
    auth: string
    created_at?: string
    endpoint: string
    id?: never
    p256dh: string
    user_agent?: string | null
    user_id: string
  }
  Update: {
    app?: string
    auth?: string
    created_at?: string
    endpoint?: string
    id?: never
    p256dh?: string
    user_agent?: string | null
    user_id?: string
  }
  Relationships: []
}
