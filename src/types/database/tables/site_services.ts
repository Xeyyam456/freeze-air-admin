// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    details: string
    icon: string
    id: number
    image_url: string | null
    includes: string[]
    is_active: boolean
    lead: string
    note: string
    slug: string
    sort: number
    steps: string[]
    text: string
    title: string
  }
  Insert: {
    details?: string
    icon?: string
    id?: never
    image_url?: string | null
    includes?: string[]
    is_active?: boolean
    lead?: string
    note?: string
    slug: string
    sort?: number
    steps?: string[]
    text?: string
    title: string
  }
  Update: {
    details?: string
    icon?: string
    id?: never
    image_url?: string | null
    includes?: string[]
    is_active?: boolean
    lead?: string
    note?: string
    slug?: string
    sort?: number
    steps?: string[]
    text?: string
    title?: string
  }
  Relationships: []
}
