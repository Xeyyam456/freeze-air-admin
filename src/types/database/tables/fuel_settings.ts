// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    diesel_price: number | null
    id: number
    petrol_price: number | null
    updated_at: string
    updated_by: string | null
  }
  Insert: {
    diesel_price?: number | null
    id?: number
    petrol_price?: number | null
    updated_at?: string
    updated_by?: string | null
  }
  Update: {
    diesel_price?: number | null
    id?: number
    petrol_price?: number | null
    updated_at?: string
    updated_by?: string | null
  }
  Relationships: []
}
