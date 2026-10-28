// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    id: number
    image_url: string | null
    is_active: boolean
    key: string
    place: string
    sort: number
    text: string
    title: string
  }
  Insert: {
    id?: never
    image_url?: string | null
    is_active?: boolean
    key: string
    place?: string
    sort?: number
    text?: string
    title: string
  }
  Update: {
    id?: never
    image_url?: string | null
    is_active?: boolean
    key?: string
    place?: string
    sort?: number
    text?: string
    title?: string
  }
  Relationships: []
}
