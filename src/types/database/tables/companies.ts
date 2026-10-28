// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    address: string | null
    contact_person: string | null
    created_at: string
    id: number
    kind: string
    lat: number | null
    lng: number | null
    logo_url: string | null
    name: string
    notes: string | null
    phone: string | null
  }
  Insert: {
    address?: string | null
    contact_person?: string | null
    created_at?: string
    id?: never
    kind?: string
    lat?: number | null
    lng?: number | null
    logo_url?: string | null
    name: string
    notes?: string | null
    phone?: string | null
  }
  Update: {
    address?: string | null
    contact_person?: string | null
    created_at?: string
    id?: never
    kind?: string
    lat?: number | null
    lng?: number | null
    logo_url?: string | null
    name?: string
    notes?: string | null
    phone?: string | null
  }
  Relationships: []
}
