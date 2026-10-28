// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    id: number
    is_active: boolean
    label: string
    sort: number
    value: string
  }
  Insert: {
    id?: never
    is_active?: boolean
    label: string
    sort?: number
    value: string
  }
  Update: {
    id?: never
    is_active?: boolean
    label?: string
    sort?: number
    value?: string
  }
  Relationships: []
}
