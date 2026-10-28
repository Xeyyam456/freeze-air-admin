// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    equipment: string[]
    id: number
    image_position: string
    image_url: string | null
    is_active: boolean
    issues: string[]
    lead: string
    note: string
    slug: string
    sort: number
    summary: string
    title: string
    updated_at: string
    work: string[]
  }
  Insert: {
    equipment?: string[]
    id?: never
    image_position?: string
    image_url?: string | null
    is_active?: boolean
    issues?: string[]
    lead?: string
    note?: string
    slug: string
    sort?: number
    summary?: string
    title: string
    updated_at?: string
    work?: string[]
  }
  Update: {
    equipment?: string[]
    id?: never
    image_position?: string
    image_url?: string | null
    is_active?: boolean
    issues?: string[]
    lead?: string
    note?: string
    slug?: string
    sort?: number
    summary?: string
    title?: string
    updated_at?: string
    work?: string[]
  }
  Relationships: []
}
