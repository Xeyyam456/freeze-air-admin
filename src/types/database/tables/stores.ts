// Avtomatik yaradılıb: scripts/split-db-types.mjs (əl ilə dəyişmə)
export type Table = {
  Row: {
    address: string | null
    code: string
    company_id: number
    created_at: string
    id: number
    lat: number | null
    lng: number | null
    name: string
    notes: string | null
    phone: string | null
  }
  Insert: {
    address?: string | null
    code: string
    company_id: number
    created_at?: string
    id?: never
    lat?: number | null
    lng?: number | null
    name: string
    notes?: string | null
    phone?: string | null
  }
  Update: {
    address?: string | null
    code?: string
    company_id?: number
    created_at?: string
    id?: never
    lat?: number | null
    lng?: number | null
    name?: string
    notes?: string | null
    phone?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "stores_company_id_fkey"
      columns: ["company_id"]
      isOneToOne: false
      referencedRelation: "companies"
      referencedColumns: ["id"]
    },
  ]
}
