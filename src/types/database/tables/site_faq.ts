// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    answer: string
    id: number
    is_active: boolean
    question: string
    sort: number
  }
  Insert: {
    answer: string
    id?: never
    is_active?: boolean
    question: string
    sort?: number
  }
  Update: {
    answer?: string
    id?: never
    is_active?: boolean
    question?: string
    sort?: number
  }
  Relationships: []
}
