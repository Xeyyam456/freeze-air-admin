// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    category: string | null
    created_at: string
    id: number
    inventory_code: string | null
    kind: string
    min_stock: number | null
    name: string
    notes: string | null
    pack_name: string | null
    pack_size: number | null
    quantity: number
    unit: string
  }
  Insert: {
    category?: string | null
    created_at?: string
    id?: never
    inventory_code?: string | null
    kind?: string
    min_stock?: number | null
    name: string
    notes?: string | null
    pack_name?: string | null
    pack_size?: number | null
    quantity?: number
    unit?: string
  }
  Update: {
    category?: string | null
    created_at?: string
    id?: never
    inventory_code?: string | null
    kind?: string
    min_stock?: number | null
    name?: string
    notes?: string | null
    pack_name?: string | null
    pack_size?: number | null
    quantity?: number
    unit?: string
  }
  Relationships: []
}
