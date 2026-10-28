// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
// Anbar vəziyyəti: ümumi say, ustalarda, təmirdə, depoda qalan (view-da sütunlar null olmur, tiplər əl ilə dəqiqləşdirilib)
export type Table = {
  Row: {
    available: number
    category: string | null
    created_at: string
    given_out: number
    id: number
    in_repair: number
    inventory_code: string | null
    kind: string
    min_stock: number | null
    name: string
    notes: string | null
    pack_name: string | null
    pack_size: number | null
    pieces_count: number
    pieces_total: number
    quantity: number
    unit: string
  }
  Relationships: []
}
